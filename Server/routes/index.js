const express = require("express");
const passport = require("passport");
const db = require("../db");
const {
  isLoggedIn,
  isBrandOwner,
  isStoreOwner,
  isProductOwner,
} = require("../middleware");
const bCrypt = require("bcryptjs");

const router = express.Router();

//CRUD

// Create Routes (add the params to the body)

router.post("/invoice/:uid", isLoggedIn, async (req, res, next) => {
  // TODO : TEST THIS
  try {
    if (req.user.uid !== req.params.uid) {
      throw new Error("Users do not match");
    }
    let { pname, Price, Quantity } = req.body;
    let pid = await db.fetchID("products", "pid", "Pname", pname);
    let pQuan = await db.fetchOneField("products", "PStock", "pid", pid[0].pid);
    if (pQuan[0].PStock >= Quantity) {
      let res = await db.updateTable(
        "products",
        "pid",
        pid[0].pid,
        "PStock",
        pQuan[0].PStock - Quantity
      );
      console.log(res);
    } else {
      throw new Error("not enough stock");
    }
    let response = await db.insertInvoice(
      req.params.uid,
      pid[0].pid,
      pname,
      Price,
      Quantity
    );
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

router.post(
  "/provides/:bid",
  isLoggedIn,
  isBrandOwner,
  async (req, res, next) => {
    // TODO : TEST THIS
    try {
      let sid = await db.fetchID("stores", "sid", "sname", req.body.storeName);
      let response = await db.insertProvides(
        req.params.bid,
        sid[0].sid,
        req.body.Discount
      );
      console.log(response);
      res.send(response);
    } catch (e) {
      console.log(e);
      res.status(404).send("error");
    }
  }
);

router.post("/selectproduct/:pid", isLoggedIn, async (req, res, next) => {
  // DO WE UPDATE PRODUCTS TABLE WHEN THIS IS POSTED OR NOT ?
  try {
    let c_id = await db.fetchID("customercart", "c_id", "name", req.body.cname);
    let response = await db.insertSelectProduct(
      c_id[0].c_id,
      req.params.pid,
      req.body.Quantity
    );
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

router.post("/transaction/:c_id", isLoggedIn, async (req, res, next) => {
  try {
    let response = await db.insertTransaction(
      req.body.total,
      req.body.due,
      req.body.gst,
      req.body.paid,
      req.body.discount,
      req.body.payment_method,
      req.params.c_id
    );
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

router.post("/brands", isLoggedIn, async (req, res, next) => {
  // TODO: ADD AUTH TO THIS
  try {
    if (req.user.user_type === "admin" || req.user.user_type === "brandOwner") {
      const bName = req.body.brandName;
      const response = await db.insertBrands(bName, req.user.uid);
      res.send(response);
    } else {
      throw new Error("not authorised");
    }
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

// router.post("/invusers", async (req, res, next) => {
//   try {
//     let response = await db.insertInvUser(
//       req.body.username,
//       req.body.password,
//       req.body.userType
//     );
//     console.log(response);
//     res.send(response);
//   } catch (e) {
//     console.log(e);
//     res.status(404);
//   }
// }); (obsolete)

router.post("/stores", isLoggedIn, async (req, res, next) => {
  // TODO: ADD AUTH TO THIS
  try {
    if (req.user.user_type === "admin" || req.user.user_type === "storeOwner") {
      let response = await db.insertStores(
        `${req.body.sname}`,
        `${req.body.address}`,
        `${req.body.MobNo}`,
        `${req.user.uid}`
      );
      console.log(response);
      res.send(response);
    } else {
      throw new Error("not authorised");
    }
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

router.post("/categories", isLoggedIn, async (req, res, next) => {
  try {
    let response = await db.insertCategories(`${req.body.categoryName}`);
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

router.post("/products", isLoggedIn, async (req, res, next) => {
  try {
    console.log("body is ", req.body);
    let cid = await db.fetchID(
      "categories",
      "cid",
      "CategoryName",
      `${req.body.CategoryName}`
    ); // logic needed here
    let bid = await db.fetchID(
      "brands",
      "bid",
      "brandName",
      `${req.body.brandName}`
    );
    let sid = await db.fetchID("stores", "sid", "sname", `${req.body.sname}`);
    let response = await db.insertProducts(
      cid[0].cid,
      bid[0].bid,
      sid[0].sid,
      req.body.Pname,
      req.body.Pstock,
      req.body.Price
    );
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
}); //works right, needs work

router.post("/customerCart", isLoggedIn, async (req, res, next) => {
  try {
    let response = await db.insertCart(req.body.cname, req.body.number);
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(404).send("error");
  }
});

// signup and login routes (need a ton of work....)

router.post(
  "/signup",
  passport.authenticate("local-signup", {
    //working... kinda
    successRedirect: "/",
    failureRedirect: "/signup",
  })
);

router.post(
  "/login",
  passport.authenticate("local-signin", {
    //working... phew
    successRedirect: "/",
    failureRedirect: "/signup",
  })
);

// Read Routes

router.get("/stores/:storeID", async (req, res, next) => {
  try {
    let products = await db.fetchOneField(
      "products",
      "*",
      "sid",
      `'${req.params.storeID}'`
    );
    console.log(products);
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.get("/stores", async (req, res, next) => {
  try {
    let stores = await db.fetchAll("stores");
    console.log(stores);
    res.send(stores);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.get("/brands/:brandID", async (req, res, next) => {
  try {
    let brand = await db.fetchOneField(
      "products",
      "*",
      "bid",
      `'${req.params.brandID}'`
    );
    console.log(brand);
    res.send(brand);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.get("/brands", async (req, res, next) => {
  //admin
  try {
    let brands = await db.fetchAll("brands");
    console.log(brands);
    res.send(brands);
  } catch (e) {
    console.log(e);
  }
});

router.get("/invusers", async (req, res, next) => {
  // TODO : MAKE THIS ADMIN EXCLUSIVE
  try {
    if (req.user.user_type === "admin") {
      let users = await db.fetchAll("invuser");
      console.log(users);
      res.send(users);
    }
  } catch (e) {
    console.log(e);
    res.status(404);
  }
});

router.get("/products/:productID", async (req, res, next) => {
  // working
  try {
    let product = await db.fetchOneField(
      "products",
      "*",
      "pid",
      `'${req.params.productID}'`
    );
    console.log(product);
    res.send(product);
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.get("/products", async (req, res, next) => {
  try {
    let products = await db.fetchAll("products");
    console.log(products);
    res.send(products);
  } catch (e) {
    console.log(e);
    res.status(400).send("error!");
  }
});

// logout route

router.get("/logout", async (req, res, next) => {
  // working
  req.session.destroy((err) => {
    if (!err) {
      res.redirect("/");
    } else {
      res.send("err");
    }
  });
});

// Update Routes

router.put("/invusers/:uid", isLoggedIn, async (req, res, next) => {
  try {
    if (req.user.user_type === "admin" || req.user.uid === req.params.uid) {
      let response = [];
      if (req.body.password) {
        let generateHash = (password) => {
          return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };
        const userPassword = generateHash(req.body.password);
        let resp = await db.updateTable(
          "users",
          "uid",
          `'${req.params.uid}'`,
          "Password",
          `'${userPassword}'`
        );
        response.push(resp);
      }
      if (req.body.userType) {
        let resp = await db.updateTable(
          "users",
          "uid",
          `'${req.params.uid}'`,
          "User_type",
          `'${req.body.userType}'`
        );
        response.push(resp);
      }
      if (req.body.UpdatedAt) {
        let resp = await db.updateTable(
          "users",
          "uid",
          `'${req.params.uid}'`,
          "UpdatedAt",
          `'${req.body.LastLogin}'`
        );
        response.push(resp);
      }
      if (response.length > 0) {
        console.log(response);
        res.send(response);
      } else {
        throw new Error("nothing to change!");
      }
    } else {
      throw new Error("Not Authorised");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.put(
  "/products/:pid",
  isLoggedIn,
  isProductOwner,
  async (req, res, next) => {
    try {
      let response = []; //Pstock, addedDate and Price
      if (req.body.addedDate) {
        let resp = await db.updateTable(
          "Products",
          "pid",
          `'${req.params.pid}'`,
          "addedDate",
          `'${req.body.addedDate}'`
        );
        response.push(resp);
      }
      if (req.body.Pstock) {
        let resp;
        if (req.body.Pstock > 0) {
          resp = await db.updateTable(
            "Products",
            "pid",
            `'${req.params.pid}'`,
            "Pstock",
            `'${req.body.Pstock}'`
          );
        } else {
          resp = await db.deleteProduct(req.params.pid);
        }
        response.push(resp);
      }
      if (req.body.Price) {
        let resp = await db.updateTable(
          "Products",
          "pid",
          `'${req.params.pid}'`,
          "Price",
          `'${req.body.Price}'`
        );
        response.push(resp);
      }
      if (response.length > 0) {
        console.log(response);
        res.status(200).send(response);
      } else {
        throw new Error("nothing to change!");
      }
    } catch (e) {
      console.log(e);
      res.status(400).send("error");
    }
  }
);

router.put("/stores/:sid", isLoggedIn, isStoreOwner ,async (req, res, next) => {
  try {
    let response = [];
    if (req.body.sname) {
      let res = await db.updateTable(
        "stores",
        "sid",
        `'${req.params.sid}'`,
        "sname",
        `'${req.body.sname}'`
      );
      response.push(res);
    }
    if (response.length > 0) {
      console.log(response);
      res.send(response);
    } else {
      throw new Error("nothing to change!");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.put("/customercart/:c_id", isLoggedIn, async (req, res, next) => {
  try {
    let response = [];
    if (req.body.name) {
      let res = await db.updateTable(
        "customercart",
        "c_id",
        `'${req.params.c_id}'`,
        "name",
        `'${req.body.name}'`
      );
      response.push(res);
    }
    if (req.body.number) {
      let res = await db.updateTable(
        "customercart",
        "c_id",
        `'${req.params.c_id}'`,
        "number",
        `'${req.body.number}'`
      );
      response.push(res);
    }
    if (response.length > 0) {
      console.log(response);
      res.status(200).send({ msg: "successfully updated" });
    } else {
      throw new Error("nothing to change!");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

// router.put('/invusers/invoice', async (req, res, next) => {
//   try {} catch (e) {
//     console.log(e);
//     res.status(404).send("error");
//   }
// });

// Delete Routes

router.delete("/brands/:bid", isLoggedIn, isBrandOwner, async (req, res, next) => {
  try {
    let response = await db.deleteBrand(req.params.bid);
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.delete("/invusers/:uid", isLoggedIn, async (req, res, next) => {
  try {
    if (req.user.user_type === "admin" || req.user.uid === req.params.uid) {
      let response = await db.deleteUser(req.params.uid);
      console.log(response);
      res.send(response);
    } else {
      throw new Error("Not Authorised");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.delete("/products/:pid", isLoggedIn, isProductOwner, async (req, res, next) => {
  try {
    let response = await db.deleteProduct(req.params.pid);
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.delete("/stores/:sid", isLoggedIn, isStoreOwner, async (req, res, next) => {
  try {
    let response = await db.deleteStore(req.params.sid);
    console.log(response);
    res.send(response);
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

router.delete("/customercart/:c_id", isLoggedIn, async (req, res, next) => {
  try {
    if (req.user.user_type === "admin") {
      let response = await db.deleteCartUser(req.params.c_id);
      console.log(response);
      res.send(response);
    } else {
      throw new Error("Not Authorised");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("error");
  }
});

module.exports = router;
