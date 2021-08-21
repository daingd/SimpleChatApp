class UsersList {

    constructor(){
        this.users = [];
    }

    addUser(id,name,room){
        this.users.push({id,name,room});
        return this.users;
    }
    getUsersName(room){
        let users = this.users.filter((user) => user.room === room);
        return users.map((user) => user.name);
    }
    getUser(id){
        return this.users.filter((user) => user.id === id)[0];
    }
    removeUser(id){
        let userToRemove = this.getUser(id);
        console.log(userToRemove);
        if(userToRemove){
            this.users = this.users.filter((user) => user.id !== id);
        }
        return userToRemove;
    }
}
module.exports = {UsersList};