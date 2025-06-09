const Species = require("../models/speciesModel");
const fs = require("fs");
const path = require("path");

exports.addSpecie = async (req, res) => {
  try {
    const currentImage = req.file;
    const {
      commonName,
      localName,
      scientificName,
      familyName,
      description,
      propagation,
      plantingseason,
      harvestingseason,
      utilization,
      status,
      surveysite,
    } = req.body;

    if (
      !currentImage ||
      !commonName ||
      !localName ||
      !scientificName ||
      !familyName ||
      !description
    ) {
      return res.status(400).json({ message: "5 fields are required!!" });
    }

    // Check if scientificName already exists
    const existingSpecie = await Species.findOne({ scientificName });
    if (existingSpecie) {
      return res.status(400).json({
        message: "A species with this scientific name already exists",
      });
    }

    const newSpecies = new Species({
      imageUrl: currentImage.filename,
      commonName,
      localName,
      scientificName,
      familyName,
      description,
      propagation,
      plantingseason,
      harvestingseason,
      utilization,
      status,
      surveysite,
    });

    const savedSpecies = await newSpecies.save();

    res.status(200).json({
      message: "Species added successfully",
      specie: savedSpecies,
    });
  } catch (error) {
    console.log("Error in addSpecies controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllSpecies = async (req, res) => {
  try {
    const { local_Name = "", role = "" } = req.query;
    const page = parseInt(req.query.page) || 1;

    const query = {};
    if (local_Name) {
      query.localName = { $regex: local_Name, $options: "i" };
    }

    const totalSpecies = await Species.countDocuments(query);
    let limit;
    if (role && role !== "ADMIN") {
      limit = totalSpecies;
    } else {
      limit = 5;
    }
    const skip = (page - 1) * limit;

    const species = await Species.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalSpecies,
      totalPages: Math.ceil(totalSpecies / limit),
      currentPage: page,
      limit,
      species,
    });
  } catch (error) {
    console.log("Error in getAllSpecies controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getOneSpecie = async (req, res) => {
  try {
    const { _id } = req.params;

    const specie = await Species.findById(_id);
    if (!specie) {
      return res.status(404).json({ message: "This specie not found" });
    }

    res.status(200).json(specie);
  } catch (error) {
    console.log("Error in getOneSpecie controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateSpecie = async (req, res) => {
  try {
    const { _id } = req.params;
    const currentImage = req.file;
    const {
      commonName,
      localName,
      scientificName,
      familyName,
      description,
      propagation,
      plantingseason,
      harvestingseason,
      utilization,
      status,
      surveysite,
    } = req.body;

    const specie = await Species.findById(_id);
    if (!specie)
      return res.status(404).json({ message: "This specie not found" });

    // Provided Data
    if (commonName) specie.commonName = commonName;
    if (localName) specie.localName = localName;
    if (scientificName) specie.scientificName = scientificName;
    if (familyName) specie.familyName = familyName;
    if (description) specie.description = description;
    if (propagation) specie.propagation = propagation;
    if (plantingseason) specie.plantingseason = plantingseason;
    if (harvestingseason) specie.harvestingseason = harvestingseason;
    if (utilization) specie.utilization = utilization;
    if (status) specie.status = status;
    if (surveysite) specie.surveysite = surveysite;

    if (currentImage) {
      // Delete the old image file if it exists
      if (specie.imageUrl) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads",
          specie.imageUrl
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image file:", err);
          }
        });
      }

      // Update the imageUrl field with the new image
      specie.imageUrl = currentImage.filename;
    }
    const updatedSpecie = await specie.save();

    res
      .status(200)
      .json({ message: "Specie updated successfully", specie: updatedSpecie });
  } catch (error) {
    console.log("Error in updateSpecie controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteSpecie = async (req, res) => {
  try {
    const { _id } = req.params;

    const specie = await Species.findByIdAndDelete(_id);
    if (!specie)
      return res.status(404).json({ message: "This specie not found" });

    // Delete file image in folder uploads
    if (specie.imageUrl) {
      const imagePath = path.join(__dirname, "../uploads", specie.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) return console.log("Error Delete image file");
      });
    }

    await Species.findByIdAndDelete(_id);

    res.status(200).json({ message: "Specie deleted successfully" });
  } catch (error) {
    console.log("Error in deleteSpecie controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.searchSpecies = async (req, res) => {
  try {
    const { scientific_Name = "" } = req.query;

    const query = {};
    if (scientific_Name) {
      query.scientificName = { $regex: scientific_Name, $options: "i" };
    }

    const data = await Species.find(query);

    res.status(200).json(data);
  } catch (error) {
    console.log("Error in searchSpecies controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
