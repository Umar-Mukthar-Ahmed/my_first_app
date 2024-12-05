class userDTO {
    constructor(user) {
        this._id = user._id;
        this.name = user.username;
        this.email = user.email;
    }

}
module.exports = userDTO;