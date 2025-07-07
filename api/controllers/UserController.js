const {GetDefaultPfp} = require("../../src/assets/DefaultPfp.js");
const {
  CreateUser,
  GetUserByAuth0Id,
  DeleteUserByAuth0Id,
  PatchUserByAuth0Id,
  GetAllUsers,
  UpdateAdminByAuth0Id,
} = require("../models/User.js");

const GetUserByAuth0IdController = async (req, res) => {
  try{

    const {auth0_id} = req.params;
    if (!auth0_id){
      res.status(400).json({error: "Missing auth0_id as route parameter"});
      return;
    }

    const user = await GetUserByAuth0Id(auth0_id);

    if (!user){
      res.status(404).json({error: "User not found"});
      return;
    }
    res.status(200).json(user);

  }catch(error){
    res.status(500).json({error:error.message});
  }
};

const DeleteUserByAuth0IdController = async (req, res) => {
  try{
    const {auth0_id} = req.params;
    if (!auth0_id){
      res.status(400).json({error: "Missing auth0_id as route parameter"});
      return;
    }

    const userDeleted = await DeleteUserByAuth0Id(auth0_id);

    if (!userDeleted){
      res.status(404).json({error: "Cant delete a user that doesnt exist"});
      return;
    }

    res.status(200).json({
      message:"User deleted", 
      content:userDeleted,
    });

  }catch(error){
    res.status(500).json({error:error.message});
  }
};

const PatchUserByAuth0IdController = async (req, res) => {
  try{
    const {auth0_id} = req.params;
    const parametersToBeChanged = req.body; //its going to be a json indicating the field and the change

    if (!auth0_id){
      res.status(400).json({error: "Missing auth0_id as route parameter"});
      return;
    }

    if (parametersToBeChanged?.auth0_id){
      res.status(401).json({error: "Dont have permissions to change the external service id"});
      return;
    }

    const userUpdated = await PatchUserByAuth0Id(auth0_id, parametersToBeChanged);

    if (!userUpdated){
      res.status(404).json({error: "Cant update a user that doesnt exist"});
      return;
    }

    res.status(200).json({
      message:"User updated",
      content:userUpdated,
    });

  }catch(error){
    res.status(500).json({error:error.message});
  }
};

const CreateUserController = async (req, res) => {
  try{
    let { auth0_id, username, description, profileImage } = req.body;

    if (!auth0_id){
      res.status(400).json({error:"auth0_id field missing"});
      return;
    }
    if (!username){
      res.status(400).json({error:"username field missing"});
      return;
    }
    if (!description) {
      description = "Si pienso, juego mal";
    }
    if(!profileImage){
      profileImage = GetDefaultPfp();
    }
    else{
      profileImage = Buffer.from(profileImage, "base64");
    }

    const user = await CreateUser(auth0_id, username, description, profileImage);

    if(!user){
      throw new Error("Couldnt create user, please try again");
    }

    res.status(201).json(user);

  }catch(error){
    res.status(500).json({error:error.message});
  }
};

const SetAdminController = async (req, res) => {
  try{

    const {auth0_id, phraseOne, phraseTwo} = req.body;

    const truePhraseOne = "La mejor pelicula de la historia";
    const truePhraseTwo = "Sé que jamás podré vencerte lobo, pero nunca dejaré de luchar por esta vida";

    if (!auth0_id){
      res.status(400).json({error: "Missing auth0_id in request body"});
      return;
    }

    if(!phraseOne){
      res.status(400).json({error: "Missing phraseOne in request body"});
      return;
    }

    if(!phraseTwo){
      res.status(400).json({error: "Missing phraseTwo in request body"});
      return;
    }

    if (phraseOne !== truePhraseOne || phraseTwo !== truePhraseTwo){
      res.status(401).json({error: "It seems like we have an intruder"});
      return;
    }

    const user = await GetUserByAuth0Id(auth0_id);

    if (!user){
      res.status(404).json({error: "User not found"});
      return;
    }

    const updatedUser = await UpdateAdminByAuth0Id(auth0_id, {isAdmin: true});

    res.status(200).json({
      message: "User set as admin",
      content: updatedUser,
    });
  }catch(error){
    res.status(500).json({error:error.message});
  }
};

const GetAllUsersController = async (req, res) => {
  try{

    const {auth0_id} = req.params;

    const user = await GetUserByAuth0Id(auth0_id);

    if (!user){
      res.status(404).json({error: "User not found"});
      return;
    }

    if (!user.isAdmin){
      res.status(401).json({error: "You do not have permissions to access this resource"});
      return;
    }

    const users = await GetAllUsers(auth0_id);

    if (!users || users.length === 0){
      res.status(404).json({error: "No users found"});
      return;
    }

    res.status(200).json(users);
  }catch(error){
    res.status(500).json({error:error.message});
  }
};

module.exports = {
  CreateUserController, 
  GetUserByAuth0IdController, 
  PatchUserByAuth0IdController, 
  DeleteUserByAuth0IdController,
  SetAdminController,
  GetAllUsersController
};