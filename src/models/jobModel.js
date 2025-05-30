// src/models/jobModel.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  id_simo:      { type: Number, required: true, required: true  },
  createdDate:    { type: Date, default: Date.now, required: true },
  asignacionSalarial:   { type: Number, required: true },
  codigoEmpleo:{ type: String, required: true },
  descripcion:   { type: String, required: true },
  // add more fields as needed…
});

module.exports = mongoose.model('Job', jobSchema);
