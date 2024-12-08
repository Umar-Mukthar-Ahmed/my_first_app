class UserDTO {
    constructor(user) {
        this._id = user._id;
        this.name = user.username;
        this.email = user.email;
    }

}
module.exports = UserDTO;