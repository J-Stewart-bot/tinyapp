const getUserByEmail = function(email, database) {
  let user;
  for(const index of Object.keys(database)) {
    if (database[index].email === email) {
      user = index;
    }
  }
  return user;
};

module.exports = getUserByEmail;