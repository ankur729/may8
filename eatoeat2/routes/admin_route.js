var express = require('express');

var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
var fs = require('fs');
const moment = require('moment');
var dns = require('dns');
var os = require('os');
var randomstring = require("randomstring");


router

    .post('/add-user-info', function (req, res, next) {

        // res.send('Task API');

        db.user_infos.save({
            username: req.body.user_name,
            email: req.body.user_email,
            phone: req.body.user_contact_no,
            password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
            joined_on: moment(new Date()).format("DD/MM/YYYY"),
            coupon_detail: [],
            orders: [],
            isVerified: "true",


        }, function (err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        })

    });

router
    .post('/fetch-user-by-id', function (req, res, next) {

        db.user_infos.find({
            "_id": mongojs.ObjectId(req.body.user_id)
        }

            ,
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user);
                    res.status(200).send(user);
                }

            }

        );

    });

router
    .post('/update-user-by-id', function (req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    phone: req.body.phone,
                    eatoeat_points: req.body.eatoeat_points,
                    status: req.body.status,
                },


            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

        //    db.user_infos.find(
        //                           {"_id": mongojs.ObjectId(req.body.user_id)}   

        //                         ,function(err, user) {
        //                         if( err || !user) console.log("No  user found");
        //                         else 
        //                                 {     
        //                                     console.log(user);
        //                                     res.status(200).send(user);
        //                                 }     

        //                                     }

        //    );

    });


router

    .post('/delete-all-user', function (req, res, next) {

        db.user_infos.remove({}, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-selected-user', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.selected_user.length; i++) {

            db.user_infos.remove({
                _id: mongojs.ObjectId(req.body.selected_user[i])
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log('deleted');


            });



        }
        res.status(200).send({
            'status': 'deleted'
        });
    });



router

    .post('/active-user-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Active'

                    }

                }

                ,
                function (err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });

router

    .post('/inactive-user-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Inactive'

                    }

                }

                ,
                function (err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });


router

    .post('/active-all-user', function (req, res, next) {

        db.user_infos.find(

            {},
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Active'

                                }

                            }, {
                                multi: true
                            },
                            function (err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('activated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });

router

    .post('/inactive-all-user', function (req, res, next) {

        db.user_infos.find(

            {},
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Inactive'

                                }

                            }, {
                                multi: true
                            },
                            function (err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('Inactivated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });


router
    .get('/get-admin-id', function (req, res, next) {



        db.admin_infos.find(
            function (err, admin) {
                if (err || !admin) console.log("No  admin found");
                else {

                    if (admin.length < 1) {


                        db.admin_infos.save({

                            _id: mongojs.ObjectId(),


                        }, function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            res.status(200);
                            res.send(data);

                        });

                    } else {
                        if (admin[0].hasOwnProperty('_id')) {

                            db.admin_infos.find({},

                                function (err, admin) {
                                    if (err || !admin) console.log(err);
                                    else {

                                        console.log(admin);
                                        res.status(200).send(admin[0]);
                                    }
                                });



                        } else {
                            console.log('IT DOES NOT HAVE ID YET');
                        }
                    }


                    // res.status(200).send(admin);
                }
            });


    });


router
    .post('/add-cook-info', function (req, res, next) {



        // res.send('Task API');
        dns.lookup(os.hostname(), function (err, add, fam) {


            var cook_bn_img = randomstring.generate(13);


            var cook_banner_img = add + ':3000/uploads/cook_uploads/' + cook_bn_img + '.jpg';
            var cook_banner_img_for_web = '/uploads/cook_uploads/' + cook_bn_img + '.jpg';



            fs.writeFile("client/uploads/cook_uploads/" + cook_bn_img + ".jpg", new Buffer(req.body.cook_banner_img, "base64"), function (err) {

                if (err) {

                    throw err;
                    console.log(err);
                    res.send(err)
                } else {
                    console.log('cook banner Img uploaded');
                    // res.send("success");
                    // console.log("success!");
                }

            });

            db.cook_infos.save({

                //  Panel One
                _id: mongojs.ObjectId(),
                cook_name: req.body.cook_pname,
                cook_email: req.body.cook_pemail,
                cook_contact: req.body.cook_pcontact,
                cook_addition_contact: req.body.cook_p_additional_contact,
                cook_password: req.body.cook_password,
                about_us: req.body.cook_about_us,
                gender: req.body.cook_gender,

                //  Panel Two

                cook_delivery_by: req.body.delivery_by,
                cook_delivery_range: req.body.delivery_range,
                status: req.body.cook_isActive,
                isApproved: req.body.cook_isApproved,


                //  Panel Three

                cook_company_name: req.body.cook_company_name,
                street_address: req.body.cook_location,
                cook_latitude: req.body.cook_lat,
                cook_longitude: req.body.cook_long,
                cook_company_name: req.body.cook_company_name,
                city: req.body.cook_city,
                state: req.body.cook_state,
                pincode: req.body.cook_pincode,

                //   Panel Four

                cook_commission: req.body.cook_commission,
                bank_type: req.body.cook_acc_type,
                bank_name: req.body.cook_bank_name,
                cook_bank_branch_name: req.body.cook_branch_name,
                bank_ifsc: req.body.cook_ifsc,
                cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                bank_account_no: req.body.cook_acc_no,

                cook_banner_img: cook_banner_img,
                cook_banner_img_for_web: cook_banner_img_for_web,
                //         cook_other_payment_info: req.body.cook_other_payment_info,
                //         cook_commission: req.body.cook_commission,

                joined_on: moment(new Date()).format("DD/MM/YYYY"),
                food_details: [],
                updated_fields: []


            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                res.status(200);
                res.send({
                    'status': 'Cook Successfully Added Via Admin'
                });
                console.log('Cook Successfully Added Via Admin');
            });


        });
        // db.cook_infos.save({
        //                      cook_name:req.body.cook_name,
        //                     cook_email:req.body.cook_email,
        //                     c ook_contact:req.body.cook_contact_no,
        //                     cook_password:bcrypt.hashSync(req.body.cook_password,bcrypt.genSaltSync(10))


        //                     },function(err,cook){

        //                            if( err || !cook) console.log("err in cook");
        //                            else
        //                            {

        //                                  res.send(cook);
        //                            }
        //                         console.log('cook saved');

        //                   })

    });

router
    .get('/get-all-users', function (req, res, next) {

        console.log('this is get');
        db.user_infos.find(function (err, users) {
            if (err || !users) console.log(err);
            else {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET');

                res.status(200).send(users);
            }
        });

    });

router
    .get('/get-all-cooks', function (req, res, next) {

        // res.send('Task API');
        db.cook_infos.find({}, {
            cook_name: 1,
            cook_email: 1,
            cook_commission: 1,
            isApproved: 1,
            status: 1,
            cook_contact: 1,
            joined_on: 1,
            updated_fields: 1
        }, function (err, cooks) {
            if (err || !cooks) console.log("No  cook found");
            else {
                console.log(cooks);
                res.status(200).send(cooks);
            }
        });

    });


router
    .post('/delete-cook', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }


        res.status(200).send('ooook');
    });

router
    .get('/delete-all-cook', function (req, res, next) {


        db.cook_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all cook deletedddd');
    });



router

    .post('/active-cook-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Active'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });

router

    .post('/inactive-cook-by-id', function (req, res, next) {
        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'InActive'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });



router

    .post('/active-all-cook', function (req, res, next) {

        db.cook_infos.find(

            {},
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < data.length; i++) {



                        db.cook_infos.update({},

                            {
                                "$set": {
                                    "status": 'Active'

                                }

                            }, {
                                multi: true
                            },
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log('activated all');

                                }

                            }

                        );

                    }

                    res.status(200).send('all updated');
                }

            }

        );



    });

router

    .post('/inactive-all-cook', function (req, res, next) {

        db.cook_infos.find(

            {},
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < data.length; i++) {



                        db.cook_infos.update({},

                            {
                                "$set": {
                                    "status": 'InActive'

                                }

                            }, {
                                multi: true
                            },
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log('Inactivated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(data);
                }

            }

        );



    });





router
    .post('/delete-user', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }

        res.status(200).send('ooook');

    });


router
    .get('/delete-all-user', function (req, res, next) {


        db.user_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all user deletedddd');
    });



// res.send('Task API');

router
    .post('/save-global-setting', function (req, res, next) {


        // res.send('Task API');
        console.log(req.body.copyright);
        var web_logo_file;
        var footer_logo_file;
        var favicon_file;
        dns.lookup(os.hostname(), function (err, add, fam) {


            if (req.body.hasOwnProperty('website_logo') && req.body.website_logo != "") {
                var web_logo_temp = randomstring.generate(13);
                web_logo_file = 'uploads/global_setting_uploads/' + web_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + web_logo_temp + ".jpg", new Buffer(req.body.website_logo, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Website logo uploaded');

                    }

                });


            }

            if (req.body.hasOwnProperty('footer_logo') && req.body.footer_logo != "") {
                var footer_logo_temp = randomstring.generate(13);
                footer_logo_file = '/uploads/global_setting_uploads/' + footer_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + footer_logo_temp + ".jpg", new Buffer(req.body.footer_logo, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }
            if (req.body.hasOwnProperty('favicon') && req.body.favicon != "") {
                var favicon_temp = randomstring.generate(13);
                favicon_file = '/uploads/global_setting_uploads/' + favicon_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + favicon_temp + ".jpg", new Buffer(req.body.favicon, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }


            if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo != "") {

                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file
                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,

                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo != "") {
                console.log("ARRIVESD");
                console.log(web_logo_file);
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,



                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            }



        });




    });

router

    .get('/fetch-global-settings', function (req, res, next) {

        console.log('testing');
        db.global_setting_infos.find(

            function (err, settings) {
                if (err || !settings) console.log("No  setting found");

                else {
                    console.log(settings);
                    res.status(200).send(settings);
                }
            });

    });

router

    .get('/fetch-cuisine-name', function (req, res, next) {


        db.categories_infos.find({}, {
            category_name: 1
        },
            function (err, cuisine) {
                if (err || !cuisine) console.log("No  setting found");

                else {
                    console.log(cuisine);
                    res.status(200).send(cuisine);
                }
            });

    });

// FOR INFORMATION PAGES MANAGMENT INFO/./

router

    .post('/add-info-pages', function (req, res, next) {


        console.log(req.body);

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'info_pages':
                    {
                        '_id': mongojs.ObjectId(),
                        'info_title': req.body.info.info_title,
                        'info_page_desc': req.body.info_page_desc,
                        'info_desc': req.body.info.info_desc,
                        // 'info_meta_tag': req.body.info.info_meta_tag,
                        // 'info_meta_desc': req.body.info.info_meta_desc,
                        // 'info_meta_keyword': req.body.info.info_meta_keyword,
                        // 'info_seo_url': req.body.info.info_seo_url,
                        'info_status': req.body.info.info_status,
                        'info_sort_order': req.body.info.info_sort_order,
                        'info_tag': req.body.info.info_tag,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });


    });

router

    .post('/fetch-info-pages', function (req, res, next) {

        db.admin_infos.find(
            {},
            { info_pages: 1, _id: 0, 'info_pages.info_title': 1, 'info_pages.info_sort_order': 1, 'info_pages._id': 1 }
            ,
            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    res.status(200).send(info[0]);
                }
            });
    });


router

    .post('/fetch-info_page-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.admin_infos.findOne({
            "info_pages._id": mongojs.ObjectId(req.body.info_page_id)
        },
            {
                'info_pages.$': 1
            }
            , function (err, info) {
                if (err || !info) console.log("No  info found");
                else {

                    res.status(200).send(info);
                }

            }

        );

    });

router

    .post('/delete-selected-info-pages', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_info_page.length; i++) {

            db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'info_pages': {
                            '_id': mongojs.ObjectId(req.body.selected_info_page[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-info-pages', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });


router

    .post('/update-info-page', function (req, res, next) {


        db.admin_infos.update({
            "info_pages._id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {
                    "info_pages.$.info_title": req.body.info_title,
                    'info_pages.$.info_page_desc': req.body.info_page_desc,
                    "info_pages.$.info_desc": req.body.info_desc,
                    // "info_pages.$.info_meta_tag": req.body.info_meta_tag,
                    // "info_pages.$.info_meta_desc": req.body.info_meta_desc,
                    // "info_pages.$.info_meta_keyword": req.body.info_meta_keyword,
                    // "info_pages.$.info_seo_url": req.body.info_seo_url,
                    "info_pages.$.info_status": req.body.info_status,
                    "info_pages.$.info_title": req.body.info_title,
                    "info_pages.$.info_sort_order": req.body.info_sort_order,
                    "info_pages.$.info_tag": req.body.info_tag,

                }

            }

            ,
            function (err, info) {
                if (err || !info) console.log("No  info found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });

// FOR COUPON MANAGMENT/./

router

    .post('/add-coupon-info', function (req, res, next) {

        var coupon_data = [];
        coupon_data = req.body;

        coupon_data._id = mongojs.ObjectId();

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'coupon_infos': coupon_data

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });



    });


router

    .post('/fetch-coupon-info', function (req, res, next) {

        db.admin_infos.find({

            _id: mongojs.ObjectId(req.body.admin_id)

        }

            ,
            function (err, coupon) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    res.send(coupon[0]);

                }
            });

    });

router
    .post('/fetch-coupon-by-id', function (req, res, next) {

        console.log(req.body);

        db.admin_infos.find({
            "coupon_infos._id": mongojs.ObjectId(req.body.coupon_id)
        }, {
                'coupon_infos.$': 1
            }, function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon);
                    res.status(200).send(coupon);
                }

            }

        );

    });

router
    .post('/update-coupon-by-id', function (req, res, next) {

        console.log(req.body);

        var d = new Date();


        var curr_day_for_match = d.toString().toLowerCase().substring(0, 3) + "_frfom";

        res.send(curr_day_for_match);

        // var categories = [];

        // for (var i = 0; i < req.body.categories.length; i++) {

        //     categories[i] = req.body.categories[i];
        // }

        // db.admin_infos.update({
        //     "coupon_infos._id": mongojs.ObjectId(req.body._id)
        // },

        //     {
        //         "$set": {

        //             "coupon_infos.$.coupon_name": req.body.coupon_name,
        //             "coupon_infos.$.coupon_code": req.body.coupon_code,
        //             "coupon_infos.$.coupon_discount_operation": req.body.coupon_discount_operation,
        //             "coupon_infos.$.coupon_discount_amount": req.body.coupon_discount_amount,
        //             "coupon_infos.$.coupon_due_start": req.body.coupon_due_start,
        //             "coupon_infos.$.coupon_due_end": req.body.coupon_due_end,
        //             "coupon_infos.$.coupon_voucher_limit": req.body.coupon_voucher_limit,
        //             "coupon_infos.$.coupon_uses_per_customer": req.body.coupon_uses_per_customer,
        //             "coupon_infos.$.coupon_status": req.body.coupon_status,
        //             "coupon_infos.$.cuisine_id": req.body.cuisine_id

        //         }


        //     }

        //     ,
        //     function (err, coupon) {
        //         if (err || !coupon) console.log("No  coupon found");
        //         else {
        //             console.log(coupon);
        //             res.status(200).send(coupon);
        //         }

        //     }



        // );

    });

router

    .post('/delete-selected-coupon', function (req, res, next) {


        for (var i = 0; i < req.body.selected_coupons.length; i++) {

            db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'coupon_infos': {
                            '_id': mongojs.ObjectId(req.body.selected_coupons[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log('deleted');
                res.status(200).send(data);

            });



        }

    });


router

    .post('/delete-all-coupon', function (req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'coupon_infos': []
            }



        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-coupon-by-id', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "coupon_infos._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Enable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) console.log("No  coupon found");
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-coupon-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "coupon_infos._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Disable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) throw err;
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-coupon', function (req, res, next) {

        console.log('enabling all');
        console.log(req.body);
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }, {
                coupon_infos: 1,
                _id: 0
            }, function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                            "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                        },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Enable'

                                }

                            }

                            ,
                            function (err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });

router

    .post('/disable-all-coupon', function (req, res, next) {

        console.log(req.body);
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }, {
                coupon_infos: 1,
                _id: 0
            }, function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                            "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                        },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Disable'

                                }

                            }

                            ,
                            function (err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });


// FOR COUPON MANAGMENT /./
router

    .post('/add-social-info', function (req, res, next) {

        db.admin_infos.find({

            _id: mongojs.ObjectId(req.body.admin_id)

        }, function (err, admin) {


            if (err) {
                res.status(404);
                res.send('info not found');
            } else {

                //    res.status(200).json(user);

                // console.log(admin[0].social_info);
                var count;
                for (var i = 0; i < req.body.social.length; i++) {
                    count = 0;
                    if (admin[0].hasOwnProperty('social_info')) {
                        for (var j = 0; j < admin[0].social_info.length; j++) {

                            if (admin[0].social_info[j].social_media == req.body.social[i].social_media) {

                                count = 1;
                            }

                        }
                        if (count == 1) {

                            db.admin_infos.update({
                                "social_info.social_media": req.body.social[i].social_media
                            },

                                {
                                    "$set": {
                                        "social_info.$.social_media": req.body.social[i].social_media,
                                        "social_info.$.social_url": req.body.social[i].social_url,
                                        "social_info.$.social_status": req.body.social[i].social_status

                                    }

                                });
                        }
                        if (count == 0) {


                            db.admin_infos.findAndModify(

                                {
                                    query: {},
                                    update: {
                                        $push: {
                                            "social_info": {
                                                'social_media': req.body.social[i].social_media,
                                                'social_url': req.body.social[i].social_url,
                                                'social_status': req.body.social[i].social_status
                                            }
                                        }
                                    },
                                    new: true
                                },
                                function (err, data, lastErrorObject) {
                                    if (err) {

                                        res.send('error');
                                        throw err;

                                    }

                                    console.log('Social Details UPDATED');

                                });

                        }

                    }
                }
                res.status(200).send({
                    'status': 'fine'
                });
            }

        });



    });



router

    .post('/get-social-infos', function (req, res, next) {

        var res_social = [];
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }

            ,
            function (err, social) {
                if (err || !social) console.log(err);
                else {
                    console.log(social[0].social_info);
                    res_social = social[0].social_info;
                    res.status(200).send(res_social);
                }

            }

        );

        //res.send('this is social infos');
        //  db.social_infos.find(
        //                 { 

        //                    _id: mongojs.ObjectId('58956efa325e380c1ce8c94a')

        //                 }
        //                 ,function(err,social_infos){


        //                  if(err || social_infos=="")
        //                  {  
        //                       res.status(404);
        //                       res.send('info not found');
        //                  }else {    

        //                     //    res.status(200).json(user);
        //                     res.send(social_infos[0]);  
        //                     console.log(social_infos);
        //                  }
        //         });
    });



router

    .post('/remove-social-media', function (req, res, next) {

        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $pull: {
                    'social_info': {
                        'social_media': req.body.social_media
                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send({
                'status': 'deleted'
            });

        });

    });

router

    .get('/fetch-social-page', function (req, res, next) {

        db.admin_infos.find({

        },
            { social_info: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });


router
    .post('/add-product-category', function (req, res, next) {

        var date = new Date();
        var current_hour = date.getTime();

        var cat_name = randomstring.generate(13);
        var cat_banner = randomstring.generate(13);

        var cat_img_web = '/uploads/admin_uploads/' + cat_name + '.jpg';
        var cat_banner_web = '/uploads/admin_uploads/' + cat_banner + '.jpg';

        var category_image = 'category_image' + cat_name + '.jpg';
        var category_banner = 'category_banner' + cat_banner + '.jpg';


        fs.writeFile("client/uploads/admin_uploads/" + cat_name + ".jpg", new Buffer(req.body.cat_img, "base64"), function (err) {

            if (err) {

                throw err;
            } else {


                fs.writeFile("client/uploads/admin_uploads/" + cat_banner + ".jpg", new Buffer(req.body.cat_banner, "base64"), function (err) {

                    if (err) {

                        throw err;
                    } else {

                        db.categories_infos.save({

                            category_name: req.body.category_name,
                            meta_tag_title: req.body.meta_tag_title,
                            meta_tag_desc: req.body.meta_tag_desc,
                            cat_img: cat_img_web,
                            cat_banner: cat_banner_web,
                            meta_tag_keyword: req.body.meta_tag_keyword,

                            seo_url: req.body.seo_url,
                            category_isBottom: req.body.category_isBottom,
                            category_status: req.body.category_status,
                            category_order: req.body.category_sortOrder,
                            status: 'false'
                        }, function (err, category) {

                            if (err || !category) console.log("err in category");
                            else {

                                res.send(category);
                            }
                            console.log('category saved');

                        });



                    }

                });


            }

        });

    });



// FOR ATTRIBUTE INFO


router
    .post('/add-attribute-group', function (req, res, next) {

        db.attributes_infos.save({
            'group_name': req.body.attr_group_name,
            'sort_order': req.body.attr_group_order


        }, function (err, attr) {

            if (err) throw err;

            res.send(attr);
            console.log('attr saved');

        })

        // console.log(req.body);
        // db.attribute_infos.findAndModify(

        //     {
        //         query: {},
        //         update: {
        //             $push: {
        //                 "groupname": {
        //                     '_id': mongojs.ObjectId(),
        //                     'fields': req.body.attr_group_name,
        //                     'sort_order': req.body.attr_group_order
        //                 }
        //             }
        //         },
        //         new: true
        //     },
        //     function (err, data, lastErrorObject) {
        //         if (err) {
        //             res.status(400);
        //             res.send('error');
        //             throw err;

        //         }

        //         console.log(data.groupname);
        //         res.send(data.groupname);
        //     });

    });

router
    .get('/fetch-attribute-group', function (req, res, next) {


        db.attributes_infos.find(
            {},

            { attr_fields: 0 },
            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    console.log(info);
                    res.status(200).send(info);
                }
            });

    });



router
    .post('/fetch-attr-group-by-id', function (req, res, next) {

        console.log(req.body.attr_group_id);
        db.attributes_infos.find(
            { "_id": mongojs.ObjectId(req.body.attr_group_id) },


            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    res.status(200).send(info);
                }
            });

    });


router
    .get('/fetch-attr-group-name', function (req, res, next) {

        db.attributes_infos.find(function (err, attribute_infos) {

            if (err || !attribute_infos) console.log(err);
            else {
                res.status(200).send(attribute_infos);
                console.log(attribute_infos);
            }
        });



    });

router
    .post('/udpate-attr-group', function (req, res, next) {

        console.log('THIS IS UPDATE ATTR GROP');
        console.log(req.body);
        db.attributes_infos.findAndModify(

            {
                query: {
                    _id: mongojs.ObjectId(req.body._id)
                },
                update: {
                    $set: {

                        group_name: req.body.group_name,
                        sort_order: req.body.sort_order,


                    },


                },
                new: true
            },
            function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                res.status(200);
                res.send(data);

            });




    });

router

    .post('/delete-selected-attr-group', function (req, res, next) {
        console.log(req.body);
        for (var i = 0; i < req.body.selected_attr_group.length; i++) {

            db.attributes_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_attr_group[i])


            }, function (err, data, lastErrorObject) {
                if (err) {

                    throw err;

                }
                console.log('deleted');


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-info-pages', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });



router
    .post('/save-attr-field-name', function (req, res, next) {
        console.log(req.body);

        var value = req.body.g_name;
        db.attributes_infos.find(

            {
                'group_name': req.body.g_name

            },
            function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                console.log(data);

                db.attributes_infos.update({
                    "_id": mongojs.ObjectId(data[0]._id)
                },

                    {
                        "$push": {
                            "attr_fields": {

                                _id: mongojs.ObjectId(),
                                'group_attr': req.body.f_name,
                                'status': 'false',
                                'sort_order': req.body.sort_order,
                                'parent_group': req.body.g_name
                            }

                        }

                    }

                    ,
                    function (err, banner) {
                        if (err || !banner) console.log("No  banner found");
                        else {
                            console.log(banner);

                        }

                    }



                );
                res.send(data);
            });






    });


router
    .post('/fetch-cook-by-id', function (req, res, next) {

        db.cook_infos.find({
            _id: mongojs.ObjectId(req.body.cook_id)
        }, {
                food_details: 0
            }, function (err, cooks) {
                if (err || !cooks) console.log("No  cook found");
                else {
                    console.log(cooks);
                    res.status(200).send(cooks);
                }
            });

    });

router
    .post('/update-cook-by-id', function (req, res, next) {


        //   console.log(req.body);
        if (req.body.hasOwnProperty('cook_updated_banner_img')) {

            dns.lookup(os.hostname(), function (err, add, fam) {

                var cook_bn_img = randomstring.generate(13);


                var cook_banner_img = add + ':3000/uploads/cook_uploads/' + cook_bn_img + '.jpg';
                var cook_banner_img_for_web = '/uploads/cook_uploads/' + cook_bn_img + '.jpg';



                fs.writeFile("client/uploads/cook_uploads/" + cook_bn_img + ".jpg", new Buffer(req.body.cook_banner_img, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('cook banner Img uploaded');
                        // res.send("success");
                        // console.log("success!");
                    }

                });


                db.cook_infos.findAndModify(

                    {
                        query: {
                            _id: mongojs.ObjectId(req.body.cook_id)
                        },
                        update: {
                            $set: {

                                cook_name: req.body.cook_name,
                                cook_email: req.body.cook_email,
                                cook_contact: req.body.cook_contact,
                                cook_addition_contact: req.body.cook_addition_contact,
                                about_us: req.body.about_us,
                                gender: req.body.gender,

                                //  Panel Two

                                cook_delivery_by: req.body.cook_delivery_by,
                                //    cook_delivery_range: req.body.cook_delivery_range,
                                service_center_name: req.body.service_center_name,
                                status: req.body.status,
                                isApproved: req.body.isApproved,


                                //  Panel Three

                                cook_company_name: req.body.cook_company_name,
                                street_address: req.body.street_address,
                                cook_latitude: req.body.cook_latitude,
                                cook_longitude: req.body.cook_longitude,

                                city: req.body.city,
                                state: req.body.state,
                                pincode: req.body.pincode,

                                //   Panel Four

                                cook_commission: req.body.cook_commission,
                                bank_type: req.body.bank_type,
                                bank_name: req.body.bank_name,
                                branch_name: req.body.branch_name,

                                bank_ifsc: req.body.bank_ifsc,
                                cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                                bank_account_no: req.body.bank_account_no,

                                cook_banner_img: cook_banner_img,
                                cook_banner_img_for_web: cook_banner_img_for_web,
                                //         cook_other_payment_info: req.body.cook_other_payment_info,
                                //         cook_commission: req.body.cook_commission,

                                updated_at: moment(new Date()).format("DD/MM/YYYY"),

                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }

                        res.status(200);
                        res.send(data);

                    });


            });

        } else {

            if (req.body.isApproved == "Approved") {

                db.cook_infos.findAndModify(

                    {
                        query: {
                            _id: mongojs.ObjectId(req.body.cook_id)
                        },
                        update: {
                            $set: {
                                cook_name: req.body.cook_name,
                                cook_email: req.body.cook_email,
                                cook_contact: req.body.cook_contact,
                                cook_addition_contact: req.body.cook_addition_contact,
                                about_us: req.body.about_us,
                                gender: req.body.gender,

                                //  Panel Two

                                cook_delivery_by: req.body.cook_delivery_by,
                                //   cook_delivery_range: req.body.cook_delivery_range,
                                service_center_name: req.body.service_center_name,
                                status: req.body.status,
                                isApproved: req.body.isApproved,


                                //  Panel Three

                                cook_company_name: req.body.cook_company_name,
                                street_address: req.body.street_address,
                                cook_latitude: req.body.cook_latitude,
                                cook_longitude: req.body.cook_longitude,

                                city: req.body.city,
                                state: req.body.state,
                                pincode: req.body.pincode,

                                //   Panel Four

                                cook_commission: req.body.cook_commission,
                                bank_type: req.body.bank_type,
                                bank_name: req.body.bank_name,
                                branch_name: req.body.branch_name,
                                cook_bank_branch_name: req.body.branch_name,
                                bank_ifsc: req.body.bank_ifsc,
                                cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                                bank_account_no: req.body.bank_account_no,
                                updated_fields: [],
                                updated_at: moment(new Date()).format("DD/MM/YYYY"),
                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }

                        res.status(200);
                        res.send(data);

                    });

            }
            else {

                db.cook_infos.findAndModify(

                    {
                        query: {
                            _id: mongojs.ObjectId(req.body.cook_id)
                        },
                        update: {
                            $set: {
                                cook_name: req.body.cook_name,
                                cook_email: req.body.cook_email,
                                cook_contact: req.body.cook_contact,
                                cook_addition_contact: req.body.cook_addition_contact,
                                about_us: req.body.about_us,
                                gender: req.body.gender,

                                //  Panel Two

                                cook_delivery_by: req.body.cook_delivery_by,
                                //cook_delivery_range: req.body.cook_delivery_range,
                                service_center_name: req.body.service_center_name,
                                status: req.body.status,
                                isApproved: req.body.isApproved,


                                //  Panel Three

                                cook_company_name: req.body.cook_company_name,
                                street_address: req.body.street_address,
                                cook_latitude: req.body.cook_latitude,
                                cook_longitude: req.body.cook_longitude,

                                city: req.body.city,
                                state: req.body.state,
                                pincode: req.body.pincode,

                                //   Panel Four

                                cook_commission: req.body.cook_commission,
                                bank_type: req.body.bank_type,
                                bank_name: req.body.bank_name,
                                branch_name: req.body.branch_name,
                                cook_bank_branch_name: req.body.branch_name,
                                bank_ifsc: req.body.bank_ifsc,
                                cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                                bank_account_no: req.body.bank_account_no,

                                updated_at: moment(new Date()).format("DD/MM/YYYY"),
                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }

                        res.status(200);
                        res.send(data);

                    });

            }




        }



        if (req.body.hasOwnProperty('service_center_name')) {

            // IMP NOTE :: APPLY CHECK IF COOK ID ALREADY SAVED IN SERVICE CENTER OR NOT


            console.log('IT HAS SERCICE CENTER');
            console.log(req.body.service_center_name);


            db.admin_infos.find(
                {},
                { service_center_info: 1, _id: 0, }
                ,
                function (err, service_center) {


                    if (err) {
                        res.status(404);
                        res.send('service center not found');
                    } else {

                        var service_center_detail = service_center[0].service_center_info;
                        var check = "false";
                        console.log(req.body.cook_id);
                        for (var i = 0; i < service_center_detail.length; i++) {





                            for (var j = 0; j < service_center_detail[i].cook_arr.length; j++) {

                                if (service_center_detail[i].cook_arr[j].cook_id == req.body.cook_id) {

                                    check = "true";
                                    console.log(req.body.cook_id);
                                    console.log('IT ALREADY HAS COOK ID');
                                    db.admin_infos.update({
                                        'service_center_info.center_name': service_center_detail[i].center_name

                                    },
                                        { $pull: { 'service_center_info.$.cook_arr': { 'cook_id': req.body.cook_id } } }
                                        , function (err, data, lastErrorObject) {
                                            if (err) {
                                                res.status(400);
                                                res.send('error');
                                                throw err;

                                            }
                                            console.log('IT I SUPDA');
                                            console.log(data);
                                        }
                                    );

                                }


                            }


                        }



                        if (check == "true") {

                            db.admin_infos.findAndModify({

                                query: { "service_center_info.center_name": req.body.service_center_name },
                                update: {
                                    $push:
                                    {
                                        "service_center_info.$.cook_arr":

                                        {
                                            "cook_id": req.body.cook_id

                                        }
                                    }
                                },
                                new: true

                            },
                                function (err, data) {
                                    if (err) console.log(err);
                                    else {


                                        // IF SUCCESSFULLY UPDATED THEN DELETE PREIVIOUS ONE IF EXIST



                                    }

                                }



                            );


                        }

                        if (check == "true") {

                            // db.admin_infos.update({


                            //             },
                            //                 {$pull: {'service_center_info.$.cook_arr': {'cook_id': req.body.cook_id}}}
                            //             , function (err, data, lastErrorObject) {
                            //                 if (err) {
                            //                     res.status(400);
                            //                     res.send('error');
                            //                     throw err;

                            //                 }
                            //                 console.log('IT I SUPDA');
                            //                 console.log(data);
                            //             }
                            //             );


                        }

                        console.log(service_center);
                        //res.send(service_center[0]);
                    }
                });


        }
        //



    });

//FOR BANNER OPERATIONS

router
    .post('/add-banner-details', function (req, res, next) {

        console.log(req.body.img.length);
        var id = mongojs.ObjectId();
        db.banner_infos.save(
            {
                '_id': id, 'banner_name': req.body.banner_name, 'banner_status': req.body.banner_status
            }
            , function (err, banner) {

                if (err) throw err;



                console.log('banner DETAILS saved');

                for (var i = 0; i < req.body.choices.length; i++) {

                    var banner = randomstring.generate(13);

                    var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

                    fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.img[i], "base64"), function (err) {

                        if (err) {

                            throw err;
                            console.log(err);
                            res.send(err)
                        } else {
                            console.log('Banner Img uploaded');

                        }

                    });

                    //  db.banner_infos.update(
                    // { '_id': mongojs.ObjectId(id) },
                    // { $push: { "banner_details": { _id:mongojs.ObjectId(),'banner_title': req.body.choices[i].banner_title, 'banner_link': req.body.choices[i].banner_link, 'banner_img': banner_file, 'banner_order': req.body.choices[i].banner_order } } }

                    db.banner_infos.findAndModify({
                        query: { _id: mongojs.ObjectId(id) },
                        update: {
                            $push: {
                                banner_details: {
                                    '_id': mongojs.ObjectId(),
                                    'banner_title': req.body.choices[i].banner_title,
                                    'banner_link': req.body.choices[i].banner_link,
                                    'banner_order': req.body.choices[i].banner_order,
                                    'banner_img': banner_file

                                }
                            }
                        },
                        new: true


                    }, function (err, data, lastErrorObject) {
                        if (err) {

                            res.send('error');
                            throw err;
                            console.log(err);
                        }


                    });

                }


                res.send(banner);

            });




    });

router
    .get('/fetch-all-banner-details', function (req, res, next) {

        db.banner_infos.find({

        },
            { banner_name: 1, banner_status: 1 }
            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner[0]);
                    res.status(200).send(banner);
                }
            });
    });

router

    .post('/delete-selected-banner', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_banner.length; i++) {

            db.banner_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_banner[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                res.send('deleted')
                console.log('deleted');


            });

        }
    });

router

    .post('/delete-all-banners', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },

            update: {
                $pull: {
                    'banner_info': {

                    }
                }


            }


        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-all-coupon', function (req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $pull: {
                    'coupon_infos': {

                    }
                }


            }


        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-banner-by-id', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.banner_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "banner_status": 'Enable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) console.log("No  banner found");
                    else {
                        console.log(coupon);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-banner-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.banner_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "banner_status": 'Disable'

                    }

                }

                ,
                function (err, banner) {
                    if (err || !banner) throw err;
                    else {
                        console.log(banner);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-banner', function (req, res, next) {

        db.banner_infos.update({

        },

            {
                "$set": {
                    "banner_status": 'Enable'

                }

            },
            { multi: true }
            ,
            function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);

                }
                res.send('success');
            }



        );




    });

router

    .post('/disable-all-banner', function (req, res, next) {
        console.log('DISABLING ALL BANNER');
        db.banner_infos.update({

        },

            {
                "$set": {
                    "banner_status": 'Disable'

                }

            },
            { multi: true }
            ,
            function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);

                }
                res.send('success');
            }



        );


    });

router

    .post('/fetch-banner-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.banner_infos.findOne({
            "_id": mongojs.ObjectId(req.body.banner_id)
        }
            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);
                    res.status(200).send(banner);
                }

            }

        );

    });

router
    .post('/update-banner-img-by-id', function (req, res, next) {

        console.log(req.body);

        var banner = randomstring.generate(13);

        var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

        fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.banner_img, "base64"), function (err) {

            if (err) {

                throw err;
                console.log(err);
                res.send(err)
            } else {
                console.log('Banner Img uploaded');

            }

        });



        db.banner_infos.update({
            'banner_details._id': mongojs.ObjectId(req.body.banner_id)
        }, {
                $set: { 'banner_details.$.banner_img': banner_file }
            }
            , function (err, data, lastErrorObject) {

                if (err) {

                    res.send('error');
                    throw err;
                    console.log(err);

                }
                console.log(data);
                res.send('updated')
            });

    });


router
    .post('/update-banner-details', function (req, res, next) {

        console.log('THIS IS BANNER');
        console.log(req.body);

        db.banner_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {
                    "banner_name": req.body.banner_name,
                    "banner_status": req.body.banner_status

                }

            }

            , function (err, data, lastErrorObject) {

                if (err) {

                    res.send('error');
                    throw err;
                    console.log(err);

                }
                console.log(data);

                db.banner_infos.find(
                    {},
                    function (err, data) {


                        if (err) {
                            res.status(404);
                            res.send('layout not found');
                        } else {

                            console.log(data);

                            for (var i = 0; i < data.length; i++) {

                                if (data[i]._id == req.body._id) {

                                    for (var j = 0; j < data[i].banner_details.length; j++) {


                                        db.banner_infos.update({
                                            "banner_details._id": mongojs.ObjectId(data[i].banner_details[j]._id)
                                        },

                                            {
                                                "$set": {
                                                    "banner_details.$.banner_title": req.body.banner_details[j].banner_title,
                                                    "banner_details.$.banner_link": req.body.banner_details[j].banner_link,
                                                    "banner_details.$.banner_order": req.body.banner_details[j].banner_order,

                                                }

                                            }
                                            , function (err, data, lastErrorObject) {

                                                if (err) {

                                                    res.send('error');
                                                    throw err;
                                                    console.log(err);

                                                }


                                            }

                                        );

                                    }




                                }




                            }

                            res.send('data');


                        }
                    });



            });

    });

// LAYOUT OPERATIONS//
router
    .post('/add-layout-page', function (req, res, next) {

        var b_detail = [];
        console.log(req.body);

        db.banner_infos.find({
            _id: mongojs.ObjectId(req.body.banner_id)
        }

            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {

                    b_detail.push(banner[0].banner_details);

                    db.layout_infos.save(
                        {
                            'layout_type': req.body.layout_type,
                            'assined_banner_id': req.body.banner_id,
                            'assined_banner_name': b_detail[0],
                            'layout_status': req.body.layout_status,
                            'layout_name': req.body.layout_name
                        }
                        ,
                        function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            console.log(data);
                            res.status(200).send(data);
                        });

                }

            }

        );

    });

router

    .post('/fetch-layout-detail', function (req, res, next) {

        db.layout_infos.find(
            {},

            function (err, layout) {


                if (err) {
                    res.status(404);
                    res.send('layout not found');
                } else {

                    console.log(layout);
                    res.status(200).send(layout);
                }
            });
    });

router

    .post('/delete-selected-layout-pages', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_layout_page.length; i++) {


            db.layout_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_layout_page[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                console.log('deleted');


            });




        }
        res.send('deleted');
    });


router

    .post('/delete-all-layout-pages', function (req, res, next) {


        console.log(req.body);
        db.layout_infos.remove();

    });

router

    .post('/enable-layout-by-id', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.layout_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "layout_status": 'Enable'

                    }


                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-layout-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.layout_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "layout_status": 'Disable'

                    }


                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-layout', function (req, res, next) {

        console.log('enabling all');
        console.log(req.body);

        db.layout_infos.update({

        },

            {
                "$set": {
                    "layout_status": 'Enable'

                }

            },
            { multi: true }
            ,
            function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);

                }
                res.send('success');
            }



        );


    });

router

    .post('/disable-all-layout', function (req, res, next) {

        console.log(req.body);
        db.layout_infos.update({

        },

            {
                "$set": {
                    "layout_status": 'Disable'

                }

            },
            { multi: true }
            ,
            function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);

                }
                res.send('success');
            }



        );



    });

router

    .post('/fetch-layout-by-id', function (req, res, next) {


        db.layout_infos.find({
            "_id": mongojs.ObjectId(req.body.layout_id)
        }
            , function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);
                    res.status(200).send(layout);
                }

            }

        );

    });

router

    .post('/update-layout-page', function (req, res, next) {

        console.log(req.body.banner_name._id);
        var b_detail = [];

        db.banner_infos.find({
            '_id': mongojs.ObjectId(req.body.banner_name._id)
        }

            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {

                    console.log(banner);

                    b_detail.push(banner[0].banner_details);


                    db.layout_infos.update({
                        "_id": mongojs.ObjectId(req.body.layout_id)
                    },

                        {
                            "$set": {

                                'layout_type': req.body.layout_type,
                                'assined_banner_id': req.body.banner_id,
                                'assined_banner_name': b_detail[0],
                                'layout_status': req.body.layout_status,
                                'layout_name': req.body.layout_name

                            }

                        },
                        function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            console.log(data);
                            res.status(200).send(data);
                        });

                }

            }

        );

    });

//FOR TEMPLATE OPERATIONS

router

    .post('/save-sms-template', function (req, res, next) {
        var sms_template;

        String.prototype.replaceAll = function (target, replacement) {
            return this.split(target).join(replacement);
        };

        sms_template = req.body.sms_body.replaceAll("^", "");


        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'sms_template':
                    {
                        '_id': mongojs.ObjectId(),
                        'sms_type': req.body.sms_type,
                        'sms_template': sms_template,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

    });

router

    .post('/fetch-template-by-type', function (req, res, next) {


        db.admin_infos.find(
            { 'sms_template.sms_type': req.body.temp_view_id },
            { sms_template: 1, _id: 0 }
            ,
            function (err, template) {

                var count = 0;
                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    if (template.length > 0) {

                        for (var i = 0; i < template[0].sms_template.length; i++) {

                            if (template[0].sms_template[i].sms_type == req.body.temp_view_id) {
                                res.status(200).send(template[0].sms_template[i]);
                                count++;
                                break;
                            }
                        }
                    }
                    if (count < 1) {

                        res.send({ 'status': 'no data found' });
                    }

                    //    if(template[0].sms_template);
                    // console.log(template[0].sms_template.length);

                }
            });
    });

router

    .post('/save-email-template', function (req, res, next) {

        console.log(req.body);
        var email_templates_subj;
        var email_template_body;

        String.prototype.replaceAll = function (target, replacement) {
            return this.split(target).join(replacement);
        };

        email_templates_subj = req.body.email_subj.replaceAll("^", "");
        email_template_body = req.body.email_body.replaceAll("^", "");

        console.log('subj--' + email_templates_subj);
        console.log('body--' + email_template_body);

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'email_template':
                    {
                        '_id': mongojs.ObjectId(),
                        'email_type': req.body.email_type,
                        'email_subj': email_templates_subj,
                        'email_body': email_template_body,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

    });


router

    .post('/fetch-email-template-by-type', function (req, res, next) {



        //console.log(req.body);
        db.admin_infos.find(
            { 'email_template.email_type': req.body.temp_view_id },
            { email_template: 1, _id: 0 }
            ,
            function (err, template) {

                var count = 0;
                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    if (template.length > 0) {

                        for (var i = 0; i < template[0].email_template.length; i++) {

                            if (template[0].email_template[i].email_type == req.body.temp_view_id) {
                                res.status(200).send(template[0].email_template[i]);
                                count++;
                                break;
                            }
                        }
                    }
                    if (count < 1) {

                        res.send({ 'status': 'no data found' });
                    }

                    //    if(template[0].sms_template);
                    // console.log(template[0].sms_template.length);

                }
            });
    });


// SERVICE CENTER OPERATIONS

router

    .post('/add-service-center', function (req, res, next) {

        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $push: {
                    'service_center_info':
                    {
                        '_id': mongojs.ObjectId(),
                        'center_name': req.body.center_name,
                        'center_delivery_range': req.body.center_delivery_range,
                        'center_lat': req.body.center_lat,
                        'center_long': req.body.center_long,
                        'center_location': req.body.center_location,
                        'center_state': req.body.center_state,
                        'center_city': req.body.center_city,
                        'center_pincode': req.body.center_pincode,
                        'center_status': req.body.center_status,
                        joined_on: moment(new Date()).format("DD/MM/YYYY"),
                        "updated_at": "",

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });



    });

router

    .post('/fetch-service-center-all', function (req, res, next) {
        console.log("FETCHING");
        db.admin_infos.find(
            {},
            { service_center_info: 1, _id: 0, }
            ,
            function (err, service_center) {


                if (err) {
                    res.status(404);
                    res.send('service center not found');
                } else {

                    console.log(service_center);
                    res.send(service_center[0]);
                }
            });
    });


router

    .post('/fetch-service-center-with-orders', function (req, res, next) {

        db.admin_infos.find(
            {},
            { service_center_info: 1, _id: 0, }
            ,
            function (err, service_center) {


                if (err) {
                    res.status(404);
                    res.send('service center not found');
                } else {

                    var service_center_detail = service_center[0].service_center_info;

                    db.admin_infos.find(
                        {},
                        { delivery_boy_info: 1, _id: 0, }
                        ,
                        function (err, delivery_boy) {


                            if (err) {
                                res.status(404);
                                res.send('delivery boy not found');
                            } else {

                                // console.log(delivery_boy);
                                var delivery_boy_count = 0;

                                var delivery_boy_detail = delivery_boy[0].delivery_boy_info;

                                //  console.log(service_center_detail);
                                //  console.log(delivery_boy_detail);

                                for (var i = 0; i < service_center_detail.length; i++) {
                                    delivery_boy_count = 0;
                                    for (var j = 0; j < delivery_boy_detail.length; j++) {


                                        //   console.log(delivery_boy_detail[j].service_center_name);
                                        if (delivery_boy_detail[j].service_center_name == service_center_detail[i].center_name) {
                                            console.log('EBTERED');
                                            delivery_boy_count++;
                                            service_center_detail[i].delivery_boy_total = delivery_boy_count;
                                        }
                                    }
                                }


                                var orders_data = [];
                                var order_coll = [];
                                var total_service_center_order = 0;
                                db.user_infos.find({

                                },
                                    { orders: 1 }
                                    ,
                                    function (err, data) {
                                        if (err || !data) console.log("No  data found");
                                        else {
                                            // console.log(order);

                                            for (var i = 0; i < data.length; i++) {

                                                if (data[i].orders.length > 0) {

                                                    orders_data.push(data[i]);
                                                }

                                            }


                                            var order_obj = {};

                                            for (var j = 0; j < orders_data.length; j++) {


                                                for (var k = 0; k < orders_data[j].orders.length; k++) {

                                                    for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                                        order_coll.push(orders_data[j].orders[k].items[l]);

                                                    }

                                                }
                                            }

                                            for (var m = 0; m < service_center_detail.length; m++) {

                                                total_service_center_order = 0;

                                                for (var n = 0; n < service_center_detail[m].cook_arr.length; n++) {


                                                    for (var s = 0; s < order_coll.length; s++) {

                                                        if (order_coll[s].cook_id == service_center_detail[m].cook_arr[n].cook_id) {
                                                            console.log('fine');
                                                            total_service_center_order++;
                                                            //   break;
                                                        }

                                                    }

                                                    service_center_detail[m].total_orders = total_service_center_order;

                                                }
                                            }

                                            console.log(total_service_center_order);
                                            res.send(service_center_detail);
                                        }

                                    }

                                );








                                //    res.send(service_center_detail);
                            }
                        });
                    // console.log(service_center);
                    // res.send(service_center[0].service_center_info);
                }
            });
    });


router

    .post('/fetch-service-center-order-view', function (req, res, next) {

        console.log('view orders');
        console.log(req.body);
        //    res.send('test');
        db.admin_infos.find(
            {},
            { service_center_info: 1, _id: 0, },
            function (err, service_center) {


                if (err) {
                    res.status(404);
                    res.send('service center not found');
                } else {

                    //                    

                    var service_center_detail = service_center[0].service_center_info;

                    var selec_serv_center = [];
                    for (var i = 0; i < service_center_detail.length; i++) {

                        if (service_center_detail[i]._id == req.body.service_center_id) {
                            selec_serv_center.push(service_center_detail[i]);

                        }

                    }

                    //  console.log(selec_serv_center);
                    // res.send(selec_serv_center);
                    var orders_data = [];
                    var order_coll = [];
                    var order_obj = {};
                    var order_final_coll = [];
                    var final_obj = {};
                    db.user_infos.find({

                    },
                        { orders: 1 }
                        ,
                        function (err, data) {
                            if (err || !data) console.log("No  data found");
                            else {
                                // console.log(order);

                                for (var i = 0; i < data.length; i++) {

                                    if (data[i].orders.length > 0) {

                                        orders_data.push(data[i]);
                                    }

                                }




                                for (var j = 0; j < orders_data.length; j++) {


                                    for (var k = 0; k < orders_data[j].orders.length; k++) {

                                        // for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                        order_coll.push(orders_data[j].orders[k]);

                                        //  }

                                    }
                                }


                                //    console.log()
                                var is_break = "false";
                                for (var m = 0; m < selec_serv_center[0].cook_arr.length; m++) {



                                    for (var s = 0; s < order_coll.length; s++) {


                                        for (var b = 0; b < order_coll[s].items.length; b++) {

                                            if (order_coll[s].items[b].cook_id == selec_serv_center[0].cook_arr[m].cook_id) {

                                                final_obj = {};

                                                final_obj.order_id = order_coll[s].order_id;
                                                final_obj.username = order_coll[s].items[b].username;
                                                final_obj.food_total_price = order_coll[s].items[b].food_total_price;
                                                final_obj.date = order_coll[s].date;
                                                final_obj.time = order_coll[s].time;
                                                final_obj.order_status = order_coll[s].order_status;


                                                order_final_coll.push(final_obj);
                                                is_break = "true";
                                                break;

                                            }

                                        }

                                    }

                                }

                                //   console.log(total_service_center_order);
                                // res.send(order_final_coll);
                                res.send(order_final_coll);

                            }

                        }

                    );








                }
            });

    });


router

    .post('/delete-selected-service-center', function (req, res, next) {



        for (var i = 0; i < req.body.selected_service_center.length; i++) {

            db.admin_infos.findAndModify({
                query: {

                },
                update: {
                    $pull: {
                        'service_center_info': {
                            '_id': mongojs.ObjectId(req.body.selected_service_center[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-service-center', function (req, res, next) {



        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $pull: {
                    'service_center_info': {

                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });

    });

router

    .post('/enable-service-center-by-id', function (req, res, next) {



        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "service_center_info._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "service_center_info.$.center_status": 'Enable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-service-center-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "service_center_info._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "service_center_info.$.center_status": 'Disable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) throw err;
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-service-center', function (req, res, next) {


        db.admin_infos.find({

        }, {
                service_center_info: 1,
                _id: 0
            }, function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center[0].service_center_info);

                    for (var i = 0; i < center[0].service_center_info.length; i++) {



                        db.admin_infos.update({
                            "service_center_info._id": mongojs.ObjectId(center[0].service_center_info[i]._id)
                        },

                            {
                                "$set": {
                                    "service_center_info.$.center_status": 'Enable'

                                }

                            }

                            ,
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log(data);

                                }

                            }



                        );

                    }

                    res.status(200).send("fine");
                }

            }

        );



    });

router

    .post('/disable-all-service-center', function (req, res, next) {


        db.admin_infos.find({

        }, {
                service_center_info: 1,
                _id: 0
            }, function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center[0].service_center_info);

                    for (var i = 0; i < center[0].service_center_info.length; i++) {



                        db.admin_infos.update({
                            "service_center_info._id": mongojs.ObjectId(center[0].service_center_info[i]._id)
                        },

                            {
                                "$set": {
                                    "service_center_info.$.center_status": 'Disable'

                                }

                            }

                            ,
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log(data);

                                }

                            }



                        );

                    }

                    res.status(200).send("fine");
                }

            }

        );

    });


router

    .post('/fetch-service-center-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.admin_infos.findOne({
            "service_center_info._id": mongojs.ObjectId(req.body.service_center_id)
        },
            {
                'service_center_info.$': 1
            }
            , function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center);
                    res.status(200).send(center);
                }

            }

        );

    });



router

    .post('/update-service-center-by-id', function (req, res, next) {


        db.admin_infos.update({
            "service_center_info._id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {

                    'service_center_info.$.center_name': req.body.center_name,
                    'service_center_info.$.center_delivery_range': req.body.center_delivery_range,
                    'service_center_info.$.center_lat': req.body.center_lat,
                    'service_center_info.$.center_long': req.body.center_long,
                    'service_center_info.$.center_location': req.body.center_location,
                    'service_center_info.$.center_state': req.body.center_state,
                    'service_center_info.$.center_city': req.body.center_city,
                    'service_center_info.$.center_pincode': req.body.center_pincode,
                    'service_center_info.$.center_status': req.body.center_status,
                    'updated_at': moment(new Date()).format("DD/MM/YYYY"),


                }

            }

            ,
            function (err, center) {
                if (err || !center) console.log("No  center found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });


router

    .post('/fetch-associated-cooks', function (req, res, next) {

        console.log('ASSOCATED COOKS');
        console.log(req.body);


        db.admin_infos.find({
            "service_center_info._id": mongojs.ObjectId(req.body.service_center_id)
        },
            {
                'service_center_info.$': 1
            }
            , function (err, center) {

                if (err || !center) console.log("No  center found");
                else {
                    // console.log(center);

                    var ser_cent_name = center[0].service_center_info[0].center_name;


                    db.cook_infos.find(
                        {
                            service_center_name: ser_cent_name,

                        }
                        , function (err, cook) {

                            if (err) {

                                console.log(err);
                                res.status(400);

                                res.send('cook not find');
                            } else {

                                var ass_cook_coll = [];
                                var ass_cook_obj = {};

                                console.log(cook.length);

                                var len = cook.length;

                                for (var i = 0; i < len; i++) {

                                    ass_cook_obj = {};
                                    ass_cook_obj._id = cook[i]._id;
                                    ass_cook_obj.cook_name = cook[i].cook_name;
                                    ass_cook_obj.cook_email = cook[i].cook_email;
                                    ass_cook_obj.cook_contact = cook[i].cook_contact;
                                    ass_cook_obj.cook_commission = cook[i].cook_commission;
                                    ass_cook_obj.joined_on = cook[i].joined_on;
                                    ass_cook_obj.status = cook[i].status;

                                    ass_cook_coll.push(ass_cook_obj);


                                }

                                res.send(ass_cook_coll);

                            }

                        });

                    // res.status(200).send(center[0].service_center_info[0].center_name);
                }

            }

        );



        // db.admin_infos.update({
        //     "service_center_info._id": mongojs.ObjectId(req.body._id)
        // },

        //     {
        //         "$set": {

        //             'service_center_info.$.center_name': req.body.center_name,
        //             'service_center_info.$.center_delivery_range': req.body.center_delivery_range,
        //             'service_center_info.$.center_lat': req.body.center_lat,
        //             'service_center_info.$.center_long': req.body.center_long,
        //             'service_center_info.$.center_location': req.body.center_location,
        //             'service_center_info.$.center_state': req.body.center_state,
        //             'service_center_info.$.center_city': req.body.center_city,
        //             'service_center_info.$.center_pincode': req.body.center_pincode,
        //             'service_center_info.$.center_status': req.body.center_status,
        //             'updated_at': moment(new Date()).format("DD/MM/YYYY"),


        //         }

        //     }

        //     ,
        //     function (err, center) {
        //         if (err || !center) console.log("No  center found");
        //         else {

        //             res.status(200).send({ 'status': 'updated' });
        //         }

        //     }



        // );
    });

// DELIVERY BOY OPERATIONS


router

    .post('/add-delivery-boy', function (req, res, next) {


        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $push: {
                    'delivery_boy_info':
                    {
                        '_id': mongojs.ObjectId(),
                        'boy_name': req.body.boy_name,
                        'boy_email': req.body.boy_email,
                        'boy_contact': req.body.boy_contact,
                        'boy_password': req.body.boy_password,
                        'boy_status': req.body.boy_status,
                        'service_center_city': req.body.service_center_city,
                        'service_center_name': req.body.service_center_name,
                        'assigned_cook': req.body.selected_cook,
                        'cook_assign': req.body.cooks_arr,
                        'joined_on': moment(new Date()).format("DD/MM/YYYY"),
                        'update_at': ''

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }




            console.log(data);
            res.status(200).send(data);
        });
    });


router

    .post('/edit-delivery-boy', function (req, res, next) {


        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    'delivery_boy_info':
                    {

                        'boy_name': req.body.boy_name,
                        'boy_email': req.body.boy_email,
                        'boy_contact': req.body.boy_contact,
                        'boy_password': req.body.boy_password,
                        'boy_status': req.body.boy_status,
                        'service_center_city': req.body.service_center_city,
                        'service_center_name': req.body.service_center_name,
                        'assigned_cook': req.body.selected_cook,

                        'update_at': moment(new Date()).format("DD/MM/YYYY")

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });
    });


router

    .post('/fetch-delivery-boy-all', function (req, res, next) {
        console.log('ff');
        db.admin_infos.find(
            {},
            { delivery_boy_info: 1, _id: 0, }
            ,
            function (err, delivery_boy) {


                if (err) {
                    res.status(404);
                    res.send('delivery boy not found');
                } else {

                    console.log(delivery_boy);
                    res.send(delivery_boy[0]);
                }
            });

    });


router

    .post('/delete-selected-delivery-boy', function (req, res, next) {



        for (var i = 0; i < req.body.selected_delivery_boy.length; i++) {

            db.admin_infos.findAndModify({
                query: {

                },
                update: {
                    $pull: {
                        'delivery_boy_info': {
                            '_id': mongojs.ObjectId(req.body.selected_delivery_boy[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-delivery-boy', function (req, res, next) {



        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $pull: {
                    'delivery_boy_info': {

                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });

    });




router

    .post('/fetch-delivery-boy-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.admin_infos.findOne({
            "delivery_boy_info._id": mongojs.ObjectId(req.body.delivery_boy_id)
        },
            {
                'delivery_boy_info.$': 1
            }
            , function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });


router

    .post('/update-delivery-boy-by-id', function (req, res, next) {

        console.log(req.body);
        db.admin_infos.update({
            "delivery_boy_info._id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {

                    'delivery_boy_info.$.boy_name': req.body.boy_name,
                    'delivery_boy_info.$.boy_email': req.body.boy_email,
                    'delivery_boy_info.$.boy_contact': req.body.boy_contact,
                    'delivery_boy_info.$.boy_password': req.body.boy_password,
                    'delivery_boy_info.$.boy_status': req.body.boy_status,
                    'delivery_boy_info.$.service_center_city': req.body.service_center_city,
                    'delivery_boy_info.$.service_center_name': req.body.service_center_name,
                    'delivery_boy_info.$.cook_assign': req.body.selected_cook,

                    'delivery_boy_info.$.update_at': moment(new Date()).format("DD/MM/YYYY"),


                }

            }

            ,
            function (err, center) {
                if (err || !center) console.log("No  data found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });


// FOOTER OPERATIONS

router

    .get('/fetch-footer-details', function (req, res, next) {

        var footer_coll = [];

        db.admin_infos.find({

        },
            { social_info: 1, info_pages: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {
                    console.log(data);
                    var temp = {};
                    temp = data[0].social_info;

                    var temp2 = {};
                    temp2 = data[0].info_pages;
                    //     console.log(data[0].social_info);
                    footer_coll.push(temp);
                    footer_coll.push(temp2);
                    console.log(footer_coll);
                    res.status(200).send(footer_coll);
                }

            }

        );

    });

router

    .get('/fetch-home-banner', function (req, res, next) {

        var footer_coll = [];

        db.layout_infos.find({

            layout_name: 'home-page-banner'
        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0].assined_banner_name);
                }

            }

        );

    });

router

    .get('/fetch-food-detail-banner', function (req, res, next) {

        console.log('FETCH FOOD');
        db.layout_infos.find({

            layout_name: 'food-detail-page-banner'
        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0]);
                }

            }

        );

    });

router

    .get('/fetch-global-settings', function (req, res, next) {

        db.global_setting_infos.find({


        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0]);
                }

            }

        );

    });
// CUISINE OPERATIONS

router

    .get('/fetch-all-cuisines', function (req, res, next) {


        db.categories_infos.find({

        },
            {
                category_name: 1, category_order: 1
            }

            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });

router

    .post('/delete-selected-cuisine', function (req, res, next) {



        for (var i = 0; i < req.body.selected_cuisine.length; i++) {

            db.categories_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_cuisine[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-cuisine', function (req, res, next) {




        db.categories_infos.remove({});


    });

router

    .post('/enable-cuisine-by-id', function (req, res, next) {



        for (var i = 0; i < req.body.length; i++) {

            db.categories_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "category_status": 'Enable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-cuisine-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.categories_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "category_status": 'Disable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) throw err;
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-cuisine', function (req, res, next) {


        db.categories_infos.find({

        }, function (err, cuisine) {
            if (err || !cuisine) console.log("No  cuisine found");
            else {
                console.log('ANKUR')
                console.log(cuisine.length);

                for (var i = 0; i < cuisine.length; i++) {



                    db.categories_infos.update({
                        "_id": mongojs.ObjectId(cuisine[i]._id)
                    },

                        {
                            "$set": {
                                "category_status": 'Enable'

                            }

                        }

                        ,
                        function (err, data) {
                            if (err || !data) console.log("No  data found");
                            else {
                                console.log(data);

                            }

                        }



                    );

                }

                res.status(200).send("fine");
            }

        }

        );



    });

router

    .post('/disable-all-cuisine', function (req, res, next) {


        db.categories_infos.find({

        }, function (err, cuisine) {
            if (err || !cuisine) console.log("No  cuisine found");
            else {
                console.log('ANKUR')
                console.log(cuisine.length);

                for (var i = 0; i < cuisine.length; i++) {



                    db.categories_infos.update({
                        "_id": mongojs.ObjectId(cuisine[i]._id)
                    },

                        {
                            "$set": {
                                "category_status": 'Disable'

                            }

                        }

                        ,
                        function (err, data) {
                            if (err || !data) console.log("No  data found");
                            else {
                                console.log(data);

                            }

                        }



                    );

                }

                res.status(200).send("fine");
            }

        }

        );

    });


router

    .post('/fetch-cuisine-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.categories_infos.findOne({
            "_id": mongojs.ObjectId(req.body.cuisine_id)
        }
            , function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });

router

    .post('/update-cuisine-by-id', function (req, res, next) {

        console.log(req.body);
        db.categories_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {


                    category_name: req.body.category_name,
                    meta_tag_title: req.body.meta_tag_title,
                    meta_tag_desc: req.body.meta_tag_desc,
                    // cat_img: cat_img_web,
                    // cat_banner: cat_banner_web,
                    meta_tag_keyword: req.body.meta_tag_keyword,
                    parent: req.body.parent,
                    seo_url: req.body.seo_url,
                    category_isBottom: req.body.category_isBottom,
                    category_status: req.body.category_status,
                    category_order: req.body.category_sortOrder,
                    status: 'false'


                }

            }

            ,
            function (err, center) {
                if (err || !center) console.log("No  center found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });


// FOODS OPERATIONS

router

    .get('/fetch-all-cook-foods', function (req, res, next) {

        var food_coll = [];

        db.cook_infos.find({}, {
            'food_details': 1,
            _id: 0
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }
            //console.log(data[4].food_details.length);

            for (var i = 0; i < data.length; i++) {


                if (data[i].food_details.length > 0) {

                    for (var j = 0; j < data[i].food_details.length; j++) {
                        var food_obj = {};
                        food_obj = data[i].food_details[j];
                        food_coll.push(food_obj);
                    }
                    //  
                    //  
                }
            }

            res.send(food_coll);


        }
        );

    });


router

    .post('/fetch-food-by-id', function (req, res, next) {

        console.log(req.body);
        db.cook_infos.findOne({

            'food_details._id': mongojs.ObjectId(req.body.food_id)

        }, {
                'food_details': 1,
                _id: 0
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    console.log(err);

                    throw err;

                }
                //console.log(data[4].food_details.length);

                var food = [];

                for (var i = 0; i < data.food_details.length; i++) {

                    if (data.food_details[i]._id == req.body.food_id) {

                        food.push(data.food_details[i]);
                    }
                }
                console.log(data.food_details.length)
                res.send(food);


            }
        );



    });


router

    .post('/update-id', function (req, res, next) {

        console.log('ANKUR');
    });



router

    .post('/update-food-by-id-admin', function (req, res, next) {

        console.log('hello');


        var cuss_len = req.body.update_food_details.cuisine_list.length;

        var cuss_data = [];

        var available_hours = req.body.update_food_details.available_hours;

        console.log(available_hours);

        for (var i = 0; i < cuss_len; i++) {
            cuss_data.push(req.body.update_food_details.cuisine_list[i]);
        }


        db.cook_infos.findAndModify({
            query: { 'food_details._id': mongojs.ObjectId(req.body.update_food_details._id) },
            update: {
                $set: {
                    'food_details.$.food_selection': req.body.update_food_details.food_selection,
                    'food_details.$.food_name': req.body.update_food_details.food_name,
                    'food_details.$.food_desc': req.body.update_food_details.food_desc,
                    'food_details.$.food_price_per_plate': req.body.update_food_details.food_price_per_plate,
                    'food_details.$.food_total_qty': req.body.update_food_details.food_total_qty,
                    'food_details.$.food_min_qty': req.body.update_food_details.food_min_qty,
                    'food_details.$.food_max_qty': req.body.update_food_details.food_max_qty,
                    'food_details.$.meal_type': req.body.update_food_details.meal_type,
                    'food_details.$.cuisine_list': cuss_data,
                    'food_details.$.available_hours': available_hours,
                    'food_details.$.selected_date_from': req.body.update_food_details.selected_date_from,
                    'food_details.$.selected_date_to': req.body.update_food_details.selected_date_to,
                    'food_details.$.food_isApproved': req.body.update_food_details.food_isApproved,
                    'food_details.$.food_status': req.body.update_food_details.food_status,

                }

            }
            ,
            new: true
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            else {
                console.log(data);
                console.log('Name UPdated');


            }

            res.status(200).send('success');
        });
    });

router

    .post('/delete-selected-food', function (req, res, next) {

        console.log(req.body);


        for (var i = 0; i < req.body.selected_food.length; i++) {
            var cook_id;
            console.log('I AM ANKUR');
            console.log(i);
            db.cook_infos.find({
                'food_details._id': mongojs.ObjectId(req.body.selected_food[i])
            }

                ,
                function (err, cook) {
                    if (err) console.log("No  cook found");
                    else {
                        cook_id = cook[0]._id;
                        var food_len = cook[0].food_details.length;

                        for (var j = 0; j < food_len; j++) {

                            db.cook_infos.update(
                                { _id: mongojs.ObjectId(cook_id) },

                                { "$pull": { "food_details": { "_id": mongojs.ObjectId(req.body.selected_food[j]) } } }

                                , function (err, data, lastErrorObject) {
                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    }



                                });

                        }

                    }
                });


            // var selec_id=req.body.selected_food[i];

            // console.log(i);

        }



        res.send({ 'status': 'deleted' });
        //  db.cook_infos.update(
        //                     {_id:mongojs.ObjectId('58e2351081500b12bcaab112')},

        //                 {"$pull":{"food_details":{"_id":mongojs.ObjectId('58e3c7792da33d0970058e2b')}}}

        //             , function (err, data, lastErrorObject) {
        //                 if (err) {
        //                     res.status(400);
        //                     res.send('error');
        //                     throw err;

        //                 }

        //                      res.send({ 'status': 'deleted' });

        //             });



    });


router

    .post('/enable-food-id', function (req, res, next) {

        // for (var i = 0; i < req.body.length; i++) {
        //      var cook_id;


        //        db.cook_infos.find({
        //            'food_details._id':mongojs.ObjectId(req.body[i])
        // }

        //     ,
        //     function (err, cook) {
        //         if (err ) console.log("No  cook found");
        //         else {
        //              cook_id=cook[0]._id;
        //             //  var food_len=cook[0].food_details.length;

        //             //  for(var j=0;j<food_len;j++){

        //                     db.cook_infos.update(
        //                             {_id:mongojs.ObjectId(cook_id)},

        //                         {"$set":{"food_details.food_status":'Enable'}}

        //                     , function (err, data, lastErrorObject) {
        //                         if (err) {
        //                             res.status(400);
        //                             res.send('error');
        //                             throw err;

        //                         }



        //                     });

        //             // }

        //     }
        //        });

        //  }

        // console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "food_details._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "food_details.$.food_status": 'Enable'

                    }

                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }

        res.send('updated');
    });


//  ATTRIBUE FIELDS OPERATIONS

router
    .get('/fetch-attribute-list-detail', function (req, res, next) {


        db.attributes_infos.find(
            {},

            function (err, data) {


                if (err) {
                    res.status(404);
                    res.send('data not found');
                } else {

                    console.log(data);

                    for (var i = 0; i < data.length; i++) {

                        for (var j = 0; j < data[i].attr_fields.length; j++) {

                            data[i].attr_fields[j].parent_group = data[i].group_name;

                        }
                    }
                    res.status(200).send(data);
                }
            });

    });


router

    .post('/delete-selected-attr-field', function (req, res, next) {

        console.log(req.body.selected_attr_field[0]);

        for (var i = 0; i < req.body.selected_attr_field.length; i++) {

            db.attributes_infos.update({

                'attr_fields._id': mongojs.ObjectId(req.body.selected_attr_field[i])
            },
                {
                    '$pull': {
                        'attr_fields': {



                        }
                    }

                }

                , function (err, data, lastErrorObject) {
                    if (err) {

                        throw err;

                    }
                    console.log('deleted');

                    console.log(data);
                });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/fetch-attr-field-by-id', function (req, res, next) {

        console.log(req.body);
        // db.test.aggregate([
        //     // Get just the docs that contain a shapes element where color is 'red'
        //     {$match: { 'groupname.group_fields._id':mongojs.ObjectId(req.body.attr_id)}},
        //     {$project: {
        //         'groupname.group_fields': {$filter: {
        //             input: '$groupname.$.group_fields',
        //             as: 'shape',
        //             cond: {$eq: ['$$shape._id', mongojs.ObjectId(req.body.attr_id)]}
        //         }},
        //         _id: 0
        //     }}
        // ],function(err,data){

        // res.send(data);
        //     console.log(data);
        // });


        db.attributes_infos.find({

            'attr_fields._id': mongojs.ObjectId(req.body.attr_id)

        }

            , function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    console.log(err);

                    throw err;

                }

                console.log(data[0]);
                var attr_coll = [];
                var attr_obj = {};
                for (var i = 0; i < data[0].attr_fields.length; i++) {
                    attr_obj = {};
                    if (data[0].attr_fields[i]._id == req.body.attr_id) {

                        attr_obj._id = data[0].attr_fields[i]._id;
                        attr_obj.group_attr = data[0].attr_fields[i].group_attr;
                        attr_obj.status = data[0].attr_fields[i].status;
                        attr_obj.sort_order = data[0].attr_fields[i].sort_order;
                        attr_obj.parent_group = data[0].group_name;

                        attr_coll.push(attr_obj);
                    }
                }
                res.send(attr_coll);


            }
        );



    });

router

    .post('/update-attr-field-by-id', function (req, res, next) {

        console.log(req.body);

        db.attributes_infos.findAndModify(



            {
                query: { 'attr_fields._id': mongojs.ObjectId(req.body._id) },
                update: {
                    $set: {
                        'attr_fields.$.group_attr': req.body.group_attr,
                        'attr_fields.$.status': req.body.status,
                        'attr_fields.$.sort_order': req.body.sort_order,

                    }

                }
                ,
                new: true
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                else {
                    console.log(data);
                    console.log('Name UPdated');

                    res.status(200).send('success');
                }


            });

    });

// TILL ATTRIBUE FIELDS OPERATIONS



// BANNER DISPLAY OPERATIONS


router

    .get('/get-listing-promotional-banner', function (req, res, next) {
        var list_bann_2 = [];
        db.layout_infos.find({
            'layout_type': 'listing_banner_2',
        },
            function (err, banner) {
                if (err || !banner) console.log(err);
                else {

                    list_bann_2.push(banner);

                    db.layout_infos.find({
                        'layout_name': 'listing-background-banner',
                    },
                        function (err, banner2) {
                            if (err || !banner) console.log(err);
                            else {

                                list_bann_2.push(banner2);
                                res.status(200).send(list_bann_2);
                            }


                        }
                    );
                    // console.log(admin);


                    // for (var i = 0; i < admin[0].layout_pages.length; i++) {

                    //     if (admin[0].layout_pages[i].layout_type == 'listing_banner_2') {
                    //         var list = {};
                    //         list.list_promo_bann = admin[0].layout_pages[i];
                    //         list_bann_2.push(list);

                    //     }
                    //     if (admin[0].layout_pages[i].layout_type == 'listing_background_banner') {
                    //         var list = {};
                    //         list.list_background_img = admin[0].layout_pages[i];
                    //         list_bann_2.push(list);

                    //     }

                    // }


                }
            });
        console.log('LISTING BANNER');

    });



// TILL BANNER DISPLAY OPERATIONS 



// router

//     .post('/disable-layout-by-id', function (req, res, next) {

//         console.log(req.body);
//         for (var i = 0; i < req.body.length; i++) {

//             db.admin_infos.update({
//                 "layout_pages._id": mongojs.ObjectId(req.body[i])
//             },

//                 {
//                     "$set": {
//                         "layout_pages.$.layout_status": 'Disable'

//                     }

//                 }

//                 ,
//                 function (err, coupon) {
//                     if (err || !coupon) throw err;
//                     else {
//                         console.log(coupon);

//                     }

//                 }



//             );


//         }
//         res.status(200).send({
//             'status': 'updated'
//         });

//     });



// ORDERS OPERATIONS


router
    .get('/fetch-user-orders-all', function (req, res, next) {

        console.log('fetching');
        var orders = [];
        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);

                    for (var i = 0; i < data.length; i++) {


                        if (data[i].orders.length > 0) {

                            for (var j = 0; j < data[i].orders.length; j++) {

                                orders.push(data[i].orders[j]);
                            }


                        }

                    }

                    console.log(orders.length);

                    res.status(200).send(orders);
                }

            }

        );

    });



router
    .post('/fetch-complete-order-by-id', function (req, res, next) {

        console.log('fetching');
        console.log(req.body);
        var email;
        var phone;

        var orders = [];
        var cook_infos = [];

        db.cook_infos.find(
            {

            },
            { cook_name: 1 }
            , function (err, cook) {

                if (err) {

                    console.log(err);

                } else {

                    cook_infos.push(cook);
                    //  console.log(cook[0].cook_name);

                }


            });
        // var order_data={};
        db.user_infos.find({

        },
            { orders: 1, username: 1, email: 1, phone: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);

                    for (var i = 0; i < data.length; i++) {



                        if (data[i].orders.length > 0) {

                            for (var j = 0; j < data[i].orders.length; j++) {


                                data[i].orders[j].email = data[i].email;
                                data[i].orders[j].phone = data[i].phone;


                                orders.push(data[i].orders[j]);

                            }

                        }

                    }

                    console.log(orders.length);
                    var final_order_coll = [];
                    var final_order_detail = {};

                    for (var j = 0; j < orders.length; j++) {


                        if (orders[j].order_id == req.body.order_id) {


                            final_order_coll.push(orders[j]);
                            console.log('MATCH');
                        }

                    }


                    var service_center_coll = [];

                    db.admin_infos.find(
                        {},
                        { service_center_info: 1, _id: 0, }
                        ,
                        function (err, service_center) {


                            if (err) {
                                res.status(404);
                                res.send('service center not found');
                            } else {


                                service_center_coll = service_center[0].service_center_info;
                                var cook_name;
                                for (var i = 0; i < final_order_coll[0].items.length; i++) {


                                    for (var j = 0; j < service_center_coll.length; j++) {

                                        for (var k = 0; k < service_center_coll[j].cook_arr.length; k++) {

                                            if (final_order_coll[0].items[i].cook_id == service_center_coll[j].cook_arr[k].cook_id) {


                                                for (var s = 0; s < cook_infos[0].length; s++) {

                                                    if (cook_infos[0][s]._id == final_order_coll[0].items[i].cook_id) {

                                                        cook_name = cook_infos[0][s].cook_name;
                                                    }

                                                }


                                                final_order_coll[0].items[i].email = service_center_coll[j].center_name;
                                                final_order_coll[0].items[i].service_center_name = service_center_coll[j].center_name;
                                                final_order_coll[0].items[i].service_id = service_center_coll[j]._id;
                                                final_order_coll[0].items[i].cook_name = cook_name;


                                            }

                                        }

                                    }

                                }

                                res.status(200).send(final_order_coll);
                            }
                        });




                }

            }

        );

    });


router
    .post('/update-order-status', function (req, res, next) {

        console.log('UPDATE ORDER STATUS');
        db.user_infos.update(


            {
                // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                'sub_order_status.sub_order_id': req.body.sub_order_id

            },
            {
                $push: {
                    'sub_order_status.$.order_history': {

                        "order_status": req.body.order_status,
                        "order_comment": req.body.order_comment,
                        "status_date": moment(new Date()).format("DD/MM/YYYY"),
                        "status_time": moment().toDate().getTime(),




                    }
                }

            }
            , function (err, user, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send(err);
                    throw err;
                    console.log(err);

                }

                db.user_infos.update(


                    {
                        // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                        'sub_order_status.sub_order_id': req.body.sub_order_id

                    },
                    {
                        $set: {

                            'sub_order_status.$.sub_order_status': req.body.order_status


                        }

                    }
                    , function (err, user, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);
                            throw err;
                            console.log(err);

                        }


                    });
                res.status(200);
                res.send(user);
                console.log('user Verified');
            });
    });

router
    .post('/track-order-stat-by-id', function (req, res, next) {

        db.user_infos.find({
            'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id)
        },
            { sub_order_status: 1, _id: 0 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {

                    var track_order_coll = [];

                    for (var i = 0; i < data[0].sub_order_status.length; i++) {

                        if (data[0].sub_order_status[i].main_order_id == req.body.order_id) {

                            track_order_coll.push(data[0].sub_order_status[i]);
                        }
                    }
                    // console.log(order);
                    res.send(track_order_coll);

                }

            }

        );

    });


router
    .post('/cancel-order-status-admin', function (req, res, next) {

        db.user_infos.update(


            {
                // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                'sub_order_status.sub_order_id': parseInt(req.body.sub_order_id)

            },
            {
                $set: {

                    'sub_order_status.$.sub_order_status': 'cancelled'


                }

            }
            , function (err, user, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send(err);
                    throw err;
                    console.log(err);

                }

                res.send('cancelled');

            });


    });

router
    .post('/fetch-cook-orders-by-id', function (req, res, next) {

        console.log('fetching 2');
        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};
                    // var count = orders_data.length;
                    // var duplicate_check = true;

                    // var temp_item_coll = [];
                    // var temp_item_obj = {};

                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1

                                if (orders_data[j].orders[k].items[l].cook_id == '58df4eade498a312ac0aadfc') {


                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    // order_obj.order_status = orders_data[j].orders[k].order_status;

                                    order_obj.order_data = orders_data[j].orders[k].items[l];
                                    // order_coll.push(temp_item_obj);

                                    //   order_obj.order_data = temp_item_coll;

                                    order_coll.push(order_obj);


                                    // if (order_coll.length > 0) {

                                    //     for (var t = 0; t < order_coll.length; t++) {

                                    //         if (order_coll[t].order_id == orders_data[j].orders[k].order_id) {
                                    //             duplicate_check = true;
                                    //         }

                                    //     }

                                    // }

                                    // if (duplicate_check == false) {
                                    //     order_obj = {};
                                    //     order_obj.order_id = orders_data[j].orders[k].order_id;
                                    //     order_obj.date = orders_data[j].orders[k].date;
                                    //     order_obj.time = orders_data[j].orders[k].time;
                                    //     order_obj.order_status = orders_data[j].orders[k].order_status;

                                    //     temp_item_obj=orders_data[j].orders[k].items[l];
                                    //     temp_item_coll.push(temp_item_obj);

                                    //     order_obj.order_data = temp_item_coll;

                                    //     order_coll.push(order_obj);
                                    // }


                                }

                            }



                        }



                    }
                    res.status(200).send(order_coll);

                }

            }

        );

    });



router
    .post('/fetch-cook-orders-by-id-cook-center', function (req, res, next) {


        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};
                    var count = orders_data.length;
                    for (var j = 0; j < orders_data.length; j++) {


                        count--;
                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1
                                // '58faf626f023e30f78f2071c'
                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {

                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    //   order_obj.order_status = orders_data[j].orders[k].order_status;
                                    order_obj.order_data = orders_data[j].orders[k];

                                    order_coll.push(orders_data[j].orders[k]);

                                }

                            }

                        }

                        // CHECK FOR SELF AND EATEATO DELIVERY BY

                        //                         var check1=false;
                        //                         var check2=false;
                        //                         console.log('ORDER COLL LEN');
                        //  console.log(order_coll.length);
                        //                         for (var m = 0; m < order_coll.length; m++) {
                        //                                check1=false;
                        //                          check2=false;  

                        //                             for (var k = 0; k < orders_data[j].orders.length; k++) {

                        //                                 for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                        //                                     // DB CALL 1

                        //                                     if (orders_data[j].orders[k].items[l].delivery_by == 'Self') {
                        //                                         console.log('11');
                        //                                         check1=true;
                        //                                     }
                        //                                      if (orders_data[j].orders[k].items[l].delivery_by == 'EatoEato') {
                        //                                          console.log('12');
                        //                                         check2=true;
                        //                                     }



                        //                                 }

                        //                             }

                        //                                     console.log(check1);
                        //                                     console.log(check2);

                        //                                 if(check1==true &&  check2==true){
                        //                                     console.log('1');
                        //                                             order_coll[m].delivery_by="Service Center and Cook"

                        //                                     }

                        //                                        if(check1==true &&  check2==false){
                        //                                             console.log('2');
                        //                                             order_coll[m].delivery_by="Cook"

                        //                                     }
                        //                                        if(check1==false &&  check2==true){
                        //                                             console.log('3');
                        //                                             order_coll[m].delivery_by="Service Center"

                        //                                     }


                        //                         }




                    }
                    res.status(200).send(order_coll);

                }

            }

        );

    });

router
    .post('/fetch-delivery-boy-orders-by-id', function (req, res, next) {


        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};

                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1

                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {
                                    console.log('THISI IS INSIDE');
                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    order_obj.order_status = orders_data[j].orders[k].order_status;
                                    order_obj.username = orders_data[j].orders[k].items[l].username;

                                    order_coll.push(order_obj);

                                }

                            }

                        }



                    }
                    res.status(200).send(order_coll);

                }

            }

        );


    });


router
    .post('/fetch-cook-orders-for-front', function (req, res, next) {





        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }


                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};
                    var duplicate_check = false;
                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {

                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    order_obj.order_status = orders_data[j].orders[k].order_status;
                                    order_obj.username = orders_data[j].orders[k].items[l].username;

                                    order_coll.push(orders_data[j].orders[k]);



                                }

                            }

                        }



                    }



                    // NOW FETCHING STATUS OF FOOD

                    db.user_infos.find({

                    },
                        { sub_order_status: 1 }
                        ,
                        function (err, status) {
                            if (err || !status) console.log("No  data found");
                            else {

                                var sub_order_status = [];
                                for (var s = 0; s < status.length; s++) {

                                    if (status[s].hasOwnProperty('sub_order_status')) {

                                        if (status[s].sub_order_status.length > 0) {

                                            for (var t = 0; t < status[s].sub_order_status.length; t++) {

                                                sub_order_status.push(status[s].sub_order_status[t]);
                                            }

                                        }
                                    }

                                }


                                for (var a = 0; a < sub_order_status.length; a++) {

                                    for (var b = 0; b < order_coll.length; b++) {

                                        for (var c = 0; c < order_coll[b].items.length; c++) {

                                            if (order_coll[b].items[c].order_id == sub_order_status[a].sub_order_id) {

                                                order_coll[b].items[c].order_status = sub_order_status[a].sub_order_status;
                                            }

                                        }
                                    }
                                }


                                res.status(200).send(order_coll);
                            }
                        });

                    // res.status(200).send(order_coll);

                }

            }

        );


    });



router
    .post('/fetch-cook-orders-detail-admin', function (req, res, next) {





        var orders_data = [];
        var final_data = [];
        var user_data = [];
        var service_ceneter_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);

                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }


                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};

                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                if (orders_data[j].orders[k].items[l].cook_id == '58faf626f023e30f78f2071c') {

                                    // order_obj = {};
                                    // order_obj.order_id = orders_data[j].orders[k].order_id;
                                    // order_obj.date = orders_data[j].orders[k].date;
                                    // order_obj.time = orders_data[j].orders[k].time;
                                    // order_obj.order_status = orders_data[j].orders[k].order_status;
                                    // order_obj.username = orders_data[j].orders[k].items[l].username;

                                    order_coll.push(orders_data[j].orders[k]);



                                }

                            }

                        }



                    }



                    // NOW FETCHING STATUS OF FOOD
                    var sub_order_track_detail_obj = {};
                    var sub_order_track_detail_coll = [];

                    db.user_infos.find({

                    },
                        { sub_order_status: 1 }
                        ,
                        function (err, status) {
                            if (err || !status) console.log("No  data found");
                            else {

                                var sub_order_status = [];
                                for (var s = 0; s < status.length; s++) {

                                    if (status[s].hasOwnProperty('sub_order_status')) {

                                        if (status[s].sub_order_status.length > 0) {
                                            sub_order_track_detail_obj = {};
                                            for (var t = 0; t < status[s].sub_order_status.length; t++) {

                                                sub_order_status.push(status[s].sub_order_status[t]);
                                                sub_order_track_detail_coll.push(status[s].sub_order_status[t]);
                                            }

                                        }
                                    }

                                }


                                for (var a = 0; a < sub_order_status.length; a++) {

                                    for (var b = 0; b < order_coll.length; b++) {

                                        for (var c = 0; c < order_coll[b].items.length; c++) {

                                            if (order_coll[b].items[c].order_id == sub_order_status[a].sub_order_id) {

                                                order_coll[b].items[c].order_status = sub_order_status[a].sub_order_status;
                                            }

                                        }
                                    }
                                }


                                db.user_infos.find({

                                },
                                    { email: 1, phone: 1 }
                                    ,
                                    function (err, user) {

                                        user_data.push(user);


                                        db.admin_infos.find({

                                        },
                                            { service_center_info: 1 }
                                            ,
                                            function (err, service_center) {

                                                var obj = {};
                                                service_ceneter_data.push(service_center);
                                                obj.order_data = order_coll;
                                                final_data.push(obj);
                                                obj = {};
                                                obj.user_data = user_data;
                                                final_data.push(obj);
                                                obj = {};
                                                obj.service_center_data = service_ceneter_data;
                                                final_data.push(obj);
                                                obj = {};
                                                obj.sub_order_detail = sub_order_track_detail_coll;
                                                final_data.push(obj);
                                                res.status(200).send(final_data);

                                            }
                                        );


                                    }
                                );





                            }
                        });

                    // res.status(200).send(order_coll);

                }

            }

        );


    });
// FETCHING COOK RELATED ORDERS BY COOK ID

router
    .post('/fetch-cook-orders-by-id-admin', function (req, res, next) {


        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};


                    var total_final_for_id = 0;
                    var is_self = false;
                    var is_service_center = false;
                    var duplicate_check = false;
                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1
                                duplicate_check = false;
                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {


                                    // if (orders_data[j].orders[k].items[l].delivery_by == "Self") {
                                    //     is_self = true;
                                    // }
                                    // if (orders_data[j].orders[k].items[l].delivery_by == "EatoEato") {
                                    //     is_service_center = true;

                                    // }

                                    if (order_coll.length > 0) {

                                        for (var t = 0; t < order_coll.length; t++) {

                                            if (order_coll[t].order_id == orders_data[j].orders[k].order_id) {
                                                duplicate_check = true;
                                            }

                                        }

                                    }

                                    if (duplicate_check == false) {

                                        order_obj = {};
                                        order_obj.order_id = orders_data[j].orders[k].order_id;
                                        order_obj.date = orders_data[j].orders[k].date;
                                        order_obj.time = orders_data[j].orders[k].time;
                                        order_obj.order_status = orders_data[j].orders[k].order_status;
                                        order_obj.username = orders_data[j].orders[k].items[l].username;



                                        order_coll.push(order_obj);

                                    }




                                }


                            }




                            //   order_coll.push(orders_data[j].orders[k]);
                        }



                    }
                    console.log(order_coll.length);
                    for (var i = 0; i < order_coll.length; i++) {
                        console.log('VALIDTTE');
                        for (var j = 0; j < orders_data.length; j++) {


                            for (var k = 0; k < orders_data[j].orders.length; k++) {
                                is_self = false;
                                is_service_center = false;

                                console.log(orders_data[j].orders[k].order_id);

                                if (orders_data[j].orders[k].order_id == order_coll[i].order_id) {

                                    for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                        if (orders_data[j].orders[k].items[l].delivery_by == "Self") {

                                            is_self = true;
                                        }
                                        if (orders_data[j].orders[k].items[l].delivery_by == "EatoEato") {
                                            console.log('EATOTEOT');
                                            is_service_center = true;

                                        }

                                    }





                                }

                                if (is_self == true && is_service_center == false) {
                                    console.log('vvvvv');
                                    order_coll[i].delivery_by = "Cook";


                                }
                                if (is_self == true && is_service_center == true) {
                                    console.log('sss');
                                    order_coll[i].delivery_by = "Service Center & Cook";


                                }
                                break;
                                // if (is_service_center == true ) {
                                //     order_coll[i].delivery_by = "Service Center";
                                //      break;

                                // }
                                // order_coll[i].delivery_by = "COOK";
                                // break;


                            }
                            break;
                        }


                    }


                    // for (var i = 0; i < order_coll.length; i++) {

                    //     for (var j = 0; j < order_coll[i].items.length; j++) {

                    //         if (order_coll[i].items[j].cook_id == req.body.cook_id) {

                    //             total_final_for_id = total_final_for_id + order_coll[i].items[j].food_total_price;
                    //             if (order_coll[i].items[j].delivery_by == "Self") {
                    //                 is_self = true;
                    //             }
                    //             if (order_coll[i].items[j].delivery_by == "EatoEato") {
                    //                 is_service_center = true;

                    //             }

                    //         }
                    //     }
                    // }

                    res.status(200).send(order_coll);

                }

            }

        );


    });
// ORDERS OPERATIONS


module.exports = router;