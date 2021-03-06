const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

class Database {
    constructor(config) {
        this.config = config;
        this.mongoClient = null;
        this.db = null;
        this.uri = "mongodb://"+this.config.db.username+":"+this.config.db.password+"@"+this.config.db.host+":"+this.config.db.port+"/"+this.config.db.database+"?authSource="+this.config.db.authdb;
        
    }

    async connect() {
        this.mongoClient = new MongoClient(this.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await new Promise((resolve, reject) => {
            this.mongoClient.connect((err) => {
                assert.equal(null, err);
                console.log("Connected to db server");
                this.db = this.mongoClient.db(this.config.db.database);
                resolve(this.db);
            });
        });

        return this;
    }

    disconnect() {
        this.mongoClient.close();
        console.log("Disconnected from db server");
    }

    getViewStateList(userToken) {
        const cursor = this.db.collection('viewstate').find({ user: userToken });
        return cursor;
    }

    getViewState(vsId) {
        const cursor = this.db.collection('viewstate').find({ id: vsId });
        return cursor;
    }

    loadViewState(viewStateId) {
        const cursor = this.db.collection('viewstate').find({ id: viewStateId });
    }
      
    saveViewState(user, viewState) {
        viewState = JSON.parse(viewState);

        viewState.user = user;

        let p = this.db.collection('viewstate').insertOne(viewState);

        p.then((a, b, c) => {
            console.log("Viewstate inserted");
        });
      
        return true;
    }

    deleteUserFromViewstate(viewstateId) {
        const cursor = this.db.collection('viewstate').update({ id: viewstateId }, { user: "deleted" });
        return cursor;
    }

    deleteViewstate(viewstateId) {
        const cursor = this.db.collection('viewstate').deleteOne({ id: viewstateId });
        return cursor;
    }

    close() {
        mongoClient.close();
    }
}
module.exports = Database;
