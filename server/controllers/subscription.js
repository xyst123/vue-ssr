const DataStore = require('nedb');

const db = new DataStore();

module.exports = {
  getOne(query) {
    return new Promise((resolve, reject) => {
      db.find(query, (findError, list) => {
        if (findError) {
          reject(findError);
          return;
        }
        resolve(list);
      });
    });
  },
  getAll() {
    return new Promise((resolve, reject) => {
      db.find({}, (findError, list) => {
        if (findError) {
          reject(findError);
          return;
        }
        resolve(list);
      });
    });
  },
  remove(subscription) {
    return new Promise((resolve, reject) => {
      db.remove(subscription, { multi: true }, (removeError, number) => {
        if (removeError) {
          reject(removeError);
          return;
        }
        resolve(number);
      });
    });
  },
  set(subscription) {
    return new Promise((resolve, reject) => {
      db.findOne({ 'subscription.endpoint': subscription.endpoint }, (findError, result) => {
        if (findError) {
          reject(findError);
        } else if (result) {
          result.id = subscription.id;
          db.update({ subscription }, result, {}, (updateError) => {
            if (updateError) reject(updateError);
            resolve(subscription);
          });
        } else {
          db.insert(subscription, (insertError) => {
            if (insertError) reject(insertError);
            resolve(subscription);
          });
        }
      });
    });
  },
};
