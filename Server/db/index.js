const pool = require("./DBconfig");
const shortid = require("shortid");

let newDB = {};

// Insertion Routes

newDB.insertBrands = (bName, uid) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO brands (bid, brandName, uid) VALUES ('${id}', '${bName}', '${uid}'); `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertCategories = (cName) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO categories (cid , CategoryName ) VALUES('${id}' ,'${cName}' );`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertInvUser = (iuname, password, usertype) => { //obsolete
  const id = shortid.generate();
  const currDate = new Date();
  const date = `${currDate.getFullYear()}/${
    currDate.getMonth() + 1
  }/${currDate.getDate()} ${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}`;
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO users (uid , userame ,Password , user_type , createdAt, UpdatedAt) VALUES ('${id}', '${iuname}' ,'${password}' , '${usertype}', '${date}'); `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertCart = (cname, number) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO CustomerCart (c_id, name , number) VALUES ('${id}', '${cname}' , '${number}'); `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertStores = (sname, address, MobNo, uid) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO stores (sid, sname, address, MobNo, uid) Values ('${id}', '${sname}', '${address}', '${MobNo}', '${uid}'); `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertProvides = (bid, sid, Discount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO provides (bid, sid, Discount) VALUES ('${bid}', '${sid}', '${Discount}'); `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertTransaction = (
  total_amount,
  due,
  gst,
  paid,
  discount,
  payment_method,
  c_id
) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO transaction (tid, total_amount, due, gst, paid, discount, payment_method, c_id) VALUES ('${id}', '${total_amount}', '${due}', '${gst}', '${paid}', '${discount}', '${payment_method}', '${c_id}');`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertProducts = (cid, bid, sid, Pname, Pstock, Price) => {
  //make all these unique
  const id = shortid.generate();
  const currDate = new Date();
  const date = `${currDate.getFullYear()}/${
    currDate.getMonth() + 1
  }/${currDate.getDate()}`;
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO products (pid, cid, bid, sid, Pname, Pstock, Price, addedDate) VALUES ('${id}', '${cid}', '${bid}', '${sid}', '${Pname}', '${Pstock}', '${Price}', '${date}');`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertSelectProduct = (c_id, pid, quantity) => {
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO select_product (c_id, pid, quantity) VALUES ('${c_id}', '${pid}', '${quantity}');`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.insertInvoice = (uid, pid, Pname, Price, Quantity) => {
  const id = shortid.generate();
  return new Promise((resolve, reject) => {
    pool.query(
      ` INSERT INTO invoice (InvID, uid, pid, Pname, Price, Quantity) VALUES ('${id}', '${uid}', '${pid}', '${Pname}', '${Price}', '${Quantity}');`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

// Fetch Routes

newDB.fetchID = (table_name, id_name, field_name, value) => {
  return new Promise((resolve, reject) => {
    pool.query(
      ` SELECT ${id_name} from ${table_name} WHERE ${field_name}='${value}';`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
}; //dynamic function to import ids

newDB.fetchAll = (table_name) => {
  return new Promise((resolve, reject) => {
    pool.query(` SELECT * from ${table_name};`, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

newDB.fetchOneField = (table_name, field, col1, val1) => {
  //to be tested
  return new Promise((resolve, reject) => {
    pool.query(
      ` SELECT ${field} FROM ${table_name} ${
        col1 && val1 ? `WHERE ${col1}=${val1}` : ``
      };`,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

// Update Routes

newDB.updateTable = (tableName, pk_name, pk_value, field_name, field_value) => {
  // tableName, pk_name, pk_value, field_name, field_value
  return new Promise((resolve, reject) => {
    pool.query(
      ` UPDATE ${tableName} SET ${field_name}=${field_value} WHERE ${pk_name}=${pk_value} `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

// Delete Routes

newDB.deleteBrand = (bid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM Brands WHERE bid='${bid}' `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.deleteStore = (sid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM stores WHERE sid='${sid}' `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.deleteCartUser = (c_id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM customercart WHERE c_id='${c_id}' `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.deleteUser = (uid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM invuser WHERE uid='${uid}' `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

newDB.deleteProduct = (pid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE FROM products WHERE pid='${pid}' `,
      (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

module.exports = newDB;
