const { execSync } = require('child_process') // Documentation: https://nodejs.org/api/child_process.html
const fs = require('fs')
const path = require("path")

const OUTPUT_DIR = process.env.OUTPUT_DIR

/**
 * Check if directory is writable
 * @param {string} path path to the directory
 */
function checkWritableDir(path) {
  try {
    fs.accessSync(path, fs.constants.W_OK)
  } catch (err) {
    throw new Error(`Cannot launch module: ${path} is not writable.`)
  }
}

/**
 * Function to filter default layers (basemap, selection, etc.)
 */
function filterDefaultLayers(map) {
  return !map.match(/^((lines|points|polygons|relations)(_osm)?|selection|location_bbox)(@.+)?$/)
}

/**
 * Merge multiple PDF files into one
 * @param {string} outfile output file
 * @param {...string} infiles input files
 */
function mergePDFs(outfile, ...infiles) {
  infiles = infiles.map(file => `"${file}"`).join(" ")
  execSync(`gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -dPDFSETTINGS=/prepress -sOutputFile="${outfile}" ${infiles}`)
}

/**
 * Convert PS to PDF
 * @param {string} infile input file
 * @param {string} outfile output file
 */
function psToPDF(infile, outfile) {
  execSync(`ps2pdf ${infile} ${outfile}`)
}

/**
 * Convert text to PS
 * @param {string} infile input file
 * @param {string} outfile output file
 */
function textToPS(infile, outfile) {
  execSync(`enscript -p ${outfile} ${infile}`)
}

/**
 * Prints all the result files in the 'output' folder
 * @returns {string[]} list of result filenames
 */
function getResults() {
  const list = []
  fs.readdirSync(OUTPUT_DIR).forEach(file => {
    list.push(file)
  })
  return list
}

/**
 * Get all files of a given file type in a directory (recursive)
 * @param {string} extension file extension
 * @param {string} dir directory to search in
 * @returns {string[]} array of filenames
 */
function getFilesOfType(extension, dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      files = getFilesOfType(extension, filePath, files)
    } else if (file.slice(file.lastIndexOf('.') + 1) === extension) {
      files.push(path.join(filePath))
    }
  })
  return files
}

module.exports = {
  checkWritableDir,
  filterDefaultLayers,
  getFilesOfType,
  getResults,
  mergePDFs,
  psToPDF,
  textToPS
}
