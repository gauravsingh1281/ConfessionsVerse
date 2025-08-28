const express = require("express");
const CryptoJS = require("crypto-js");
const secretRouter = express.Router();
const User = require("../models/user.model")

secretRouter.get("/secrets", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    User.find({ secret: { $ne: null } }, (err, foundUsers) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                const decryptedSecrets = foundUsers.map((user) => {
                    const decryptedUser = { ...user.toObject() };
                    decryptedUser.secret = user.secret.map((secret) => {
                        const bytes = CryptoJS.AES.decrypt(
                            secret.content,
                            process.env.ENCRYPTION_KEY,
                            {
                                keySize: 256,
                            }
                        );
                        const originalSecret = bytes.toString(CryptoJS.enc.Utf8);
                        return { content: originalSecret };
                    });
                    return decryptedUser;
                });

                res.render("secrets", {
                    usersWithSecrets: decryptedSecrets,
                    userId: req.user?._id,
                });
            }
        }
    });
});

secretRouter.get("/submit", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});


secretRouter.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;

    // Encryption
    const encryptedSecret = CryptoJS.AES.encrypt(
        submittedSecret,
        process.env.ENCRYPTION_KEY,
        {
            keySize: 256,
        }
    ).toString();

    User.findById(req.user.id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.secret.push({ content: encryptedSecret });
                foundUser.save(() => {
                    res.redirect("/secrets");
                });
            }
        }
    });
});

secretRouter.get("/secrets/:userId", (req, res) => {
    const userId = req.params.userId;
    User.findOne({ _id: userId }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (req.isAuthenticated()) {
                    const decryptedSecrets = foundUser.secret.map((secret) => {
                        const bytes = CryptoJS.AES.decrypt(
                            secret.content,
                            process.env.ENCRYPTION_KEY,
                            {
                                keySize: 256,
                            }
                        );
                        const originalSecret = bytes.toString(CryptoJS.enc.Utf8);
                        return { content: originalSecret };
                    });

                    res.render("userSecrets", { SECRET: decryptedSecrets });
                } else {
                    res.redirect("/login");
                }
            }
        }
    });
});



module.exports = secretRouter;