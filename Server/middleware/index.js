const db = require("../db");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  throw new Error("User not authenticated");
};

module.exports.isBrandOwner = async (req, res, next) => {
  let Brand = await db.fetchOneField(
    "Brands",
    "uid",
    "bid",
    `'${req.params.bid}'`
  );
  if (
    req.user.user_type === "admin" ||
    (req.user.user_type === "brandManager" && Brand.uid === req.user.uid)
  ) {
    return next();
  }
  throw new Error("Not Authorised");
};

module.exports.isStoreOwner = async (req, res, next) => {
  await db.fetchOneField(
    "Stores",
    "uid",
    "sid",
    `"${req.params.sid}"`
  ).then ((store) => {
    console.log(store);
    if (
        req.user.user_type === "admin" ||
        (req.user.user_type === "storeOwner" && store[0].uid === req.user.uid)
      ) {
        return next();
      } else throw new Error("not authorised");
  });
};

module.exports.isProductOwner = async (req, res, next) => {
  const productStoreID = await db.fetchID(
    "Products",
    "sid",
    "pid",
    `${req.params.pid}`
  ).then(async (id) => {
    console.log(id);
    const store = await db.fetchID("Stores", "uid", "sid", id[0].sid);
    console.log(store);
    if (
      req.user.user_type === "admin" ||
      (req.user.user_type === "storeOwner" && store[0].uid === req.user.uid)
    ) {
      return next();
    } else {
        throw new Error("not authorised");
    }
  });
};
