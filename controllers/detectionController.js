const path = require('path')

const { bucket } = require(path.join(__dirname, '../config/firebaseConfig'))
const Detection = require(path.join(__dirname, '../models/detectionModel'))

const validator = require('validator')
const { v4: uuidv4 } = require('uuid')

const { exec } = require('child_process')
const fs = require('fs')

const multer = require('multer')
const storage = multer({
  storage: multer.memoryStorage(),
  fileSize: 1 * 1024 * 1024,
}).single('image')

const create = async (req, res) => {
  storage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        error: true,
        message: 'Failed to upload image!'
      })
    }

    const { model_name } = req.body
    const image = req.file

    const id = uuidv4()
    const userId = req.user.uid
    const createdAt = new Date().toISOString()

    if (validator.isEmpty(model_name)) {
      return res.status(400).json({
        error: true,
        message: 'Model is required!'
      })
    } else if (!image) {
      return res.status(400).json({
        error: true,
        message: 'Image is required!'
      })
    } else if (image.size > 1e6) {
      return res.status(413).json({
        error: true,
        message: 'Image size must not exceed 1 MB!'
      })
    }

    // Save the uploaded image to a temporary path
    const fileName = `${Date.now()}-${image.originalname}`

    // Path to the Python Interpreter
    const venvPythonPath = path.join(__dirname, '../venv/bin/python3');

    if (fs.existsSync(venvPythonPath)) {
      console.log(`Python interpreter found at: ${venvPythonPath}`);

      // Define other paths
      const scriptPath = path.join(__dirname, '../scripts/process_image.py')
      const tempFilePath = path.join(__dirname, '../tmp', fileName)
      const outputFilePath = path.join(__dirname, '../tmp/output', fileName)

      fs.writeFileSync(tempFilePath, image.buffer)

      // Execute the Python script
      exec(`${venvPythonPath} ${scriptPath} ${tempFilePath} ${model_name} ${outputFilePath}`,
        async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error processing image: ${stderr}`)
            console.error(`Script Output: ${stdout}`);
            return res.status(400).json({
              error: true,
              message: 'Failed to process image!'
            })
          }

          // Read the processed image
          const processedImageBuffer = fs.readFileSync(outputFilePath)

          const folderName = 'detections'
          const filePath = `${folderName}/${fileName}`
          const file = bucket.file(filePath)

          try {
            await file.save(processedImageBuffer, {
              metadata: { contentType: image.mimetype },
            })

            await file.makePublic()
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`

            const detection = new Detection(id, imageUrl, model_name, userId, createdAt)
            await Detection.saveDetection(detection)

            // Cleanup and Delete the temporary files
            fs.unlinkSync(tempFilePath)
            fs.unlinkSync(outputFilePath)

            return res.status(201).json({
              error: false,
              message: 'Successfully create detection!',
              createResult: detection,
            })

          } catch (error) {
            return res.status(400).json({
              error: true,
              message: 'Failed to create detection!'
            })
          }
        }
      )

    } else {
      console.error(`Python interpreter not found at: ${venvPythonPath}`);
      return res.status(500).json({
        error: true,
        message: 'Python interpreter not found in the virtual environment.',
      });
    }
  })
}

const getAll = async (req, res) => {
  const userId = req.user.uid

  try {
    const detections = await Detection.findAll(userId)
    return res.status(200).json({
      error: false,
      message: 'Successfully get detections!',
      detectionResults: detections,
    })
  } catch (error) {
    return res.status(404).json({
      error: true,
      message: 'Detections not found!'
    })
  }
}

const getById = async (req, res) => {
  const { id } = req.params
  const userId = req.user.uid

  try {
    const detection = await Detection.findById(id, userId)

    if (!detection) {
      return res.status(404).json({
        error: true,
        message: 'Detection not found!'
      })
    } else {
      return res.status(200).json({
        error: false,
        message: 'Successfully get detection!',
        detectionResult: detection,
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to get detection!'
    })
  }
}

const deleteById = async (req, res) => {
  const { id } = req.params
  const userId = req.user.uid

  try {
    const exist = await Detection.findById(id, userId)
    if (!exist) {
      return res.status(404).json({
        error: true,
        message: 'Detection not found!',
      })
    } else {
      const oldFilePath = exist.imageUrl.split(
        `https://storage.googleapis.com/${bucket.name}/`
      )[1]
      const oldFile = bucket.file(oldFilePath)

      await Detection.deleteDetection(id, userId)
      await oldFile.delete()

      return res.status(200).json({
        error: false,
        message: 'Successfully delete detection!'
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Failed to delete detection!'
    })
  }
}

module.exports = { create, getAll, getById, deleteById }
