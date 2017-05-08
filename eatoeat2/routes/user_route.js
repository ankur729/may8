var express = require('express');

var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');
var dns = require('dns');
var os = require('os');
var _ = require('underscore');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var where = require("lodash.where");
const moment = require('moment');
const moment_range = require('moment-range');
const moment_r = moment_range.extendMoment(moment);
var randomstring = require("randomstring");
// var util=require('util');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ankuridigitie@gmail.com',
        pass: 'idigitieankur'
    }
});

// setup email data with unicode symbols

router

    .post('/add-user-info', function (req, res, next) {

        // res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
        console.log(req.body);
        db.user_infos.find({
            email: req.body.user_email
        }, function (err, user_details) {

            if (user_details != "") {

                res.status(409);
                console.log('email already registered');
                res.json({
                    'error': 'Email Already Registered'
                });

            }




            else if (user_details == "") {



                db.user_infos.find({
                    phone: req.body.user_contact_no
                }, function (err, user_details_phone) {

                    if (user_details_phone != "") {

                        res.status(409);
                        console.log('email already registered');
                        res.json({
                            'error': 'Phone_No Already Registered'
                        });

                    }
                    else {

                        db.user_infos.save({
                            username: req.body.user_name,
                            email: req.body.user_email,
                            phone: req.body.user_contact_no,
                            password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
                            joined_on: moment(new Date()).format("DD/MM/YYYY"),
                            isVerified: "false",
                            status: "active",
                            coupon_detail: [],

                            orders: []


                        }, function (err, user) {

                            if (err) throw err;

                            var mailOptions = {
                                from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                                to: req.body.user_email, // list of receivers
                                subject: 'Welcome To EatoEato ', // Subject line
                                text: 'Please Activate Your EatoEato Account', // plain text body
                                html: '<b>Your Account Has Been Created by, Please Click on Below Link to Verify your Account</b> <br> <a href="http://192.168.1.157:3000/#/verify-user-params/' + user._id + '">' + randomstring.generate({ length: 100, charset: 'alphabetic' }) + '</a>' // html body
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    res.json({
                                        yo: 'error'
                                    });
                                } else {
                                    console.log('Message sent: ' + info.response);

                                };
                            });

                            res.send(user);
                            console.log(user._id);

                        })

                    }
                });
            }





        });



    });

router

    .get('/user-verify/:user_id', function (req, res, next) {
        // console.log(req.params['user_id']);
        // res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.params['user_id'])
            },
            update: {
                $set: {
                    isVerified: "true"

                }
            },
            new: true
        }, function (err, user, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send(err);
                throw err;
                console.log(err);

            }

            res.status(200);
            res.send(user);
            console.log('user Verified');
        });
    });


router

    .post('/user-login', function (req, res, next) {

        // res.send('Task API');    
        console.log(req.body);
        db.user_infos.find({

            phone: parseInt(req.body.phone),

        }, function (err, user) {


            if (err || user == "") {
                res.status(404);
                res.send('Either Bad Credential Or Not Activated Yet');
            } else {

                if (bcrypt.compareSync(req.body.password, user[0].password)) {

                    if (user[0].status == "inactive") {
                        res.status(200).send('account disabled');
                        console.log('user is inactive');
                    } else {
                        console.log(user);
                        res.status(200).send(user);

                    }

                } else {
                    res.status(400).json('unauthorized');

                }

            }
        });


    });


router

    .post('/user-pass-update', function (req, res, next) {


        console.log(req.body);
        var flag = false;
        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id)
        }, function (err, user) {

            if (err) {

                console.log(err);
                res.status(401);
                res.send(err);
            } else {

                if (bcrypt.compareSync(req.body.old_pass, user[0].password)) {

                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id)
                        },
                        update: {
                            $set: {

                                password: bcrypt.hashSync(req.body.new_pass, bcrypt.genSaltSync(10))
                            }
                        },
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if (err) {

                            flag = false;
                            console.log('this is err');
                            res.send(err);

                        }
                        res.status(200);
                        // var arr=[];
                        // var main_obj={};
                        // var obj={};
                        // obj.message="Password Updated";
                        // obj.status="true";
                        // main_obj.result=obj;
                        res.send('Password Updated');
                        flag = true;

                    })


                } else {
                    if (flag) {
                        console.log('pass updated');
                    } else if (!flag) {
                        res.status(400).send('err');
                        console.log('incorrect');
                    }
                    // res.status(200).send('fine');

                }

            }
        });

    });

router

    .post('/user-profile-update', function (req, res, next) {
        console.log('DATA RECIEVED');
        console.log(req.body);
        //   res.send(req.body);
       //  res.send(req.body);

        if (req.body.user_profile_image == '') {
            //res.send('Without Image');
            console.log('WITHOUT IMAGE')


            db.user_infos.update({
                "_id": mongojs.ObjectId(req.body.user_id)
            },

                {
                    "$set": {
                        username: req.body.username,
                        email: req.body.email,
                        phone: parseInt(req.body.phone),
                        dob: req.body.dob,
                        gender: req.body.gender,

                    }




                }, function (err, data, lastErrorObject) {
                    if (err) {

                        throw err;
                        console.log(err);

                    }
                    console.log(data);
                    res.status(200).send({ 'status': 'Profile Updated' });
                });

        } else if (req.body.user_profile_image != '') {

            //  console.log(req.body);
            //  res.send('Image Testing');
            dns.lookup(os.hostname(), function (err, add, fam) {
                var date = new Date();
                var dd = date.getTime();
                var food_img = add + ':3000/uploads/user_uploads/' + dd + '.jpg';
                var food_img_web = '/uploads/user_uploads/' + dd + '.jpg';


                fs.writeFile("client/uploads/user_uploads/" + dd + ".jpg", new Buffer(req.body.user_profile_image, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('User image uploaded');
                        // res.send("success");
                        // console.log("success!");
                    }

                });

                db.user_infos.findAndModify({
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $set: {
                            username: req.body.username,
                            email: req.body.email,
                            phone: parseInt(req.body.phone),
                            dob: req.body.dob,
                            gender: req.body.gender,
                            user_profile_image: food_img,
                            user_profile_image_web: food_img_web
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
                    res.status(200).send({ 'status': 'Profile Updated' });

                });

            });


        }


    });




router

    .post('/user-address-add', function (req, res, next) {

        console.log(req.body);
        var date = new Date();
        var timestamp_var = date.getTime();

        if (req.body.hasOwnProperty('address_default')) {

            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id),
                        'address.address_default': "true"
                    },
                    update: {
                        $set: {
                            'address.$.address_default': 'false'
                        }

                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {

                        db.user_infos.findAndModify(

                            {
                                query: {
                                    _id: mongojs.ObjectId(req.body.user_id)
                                },
                                update: {
                                    $push: {
                                        'address': {
                                            'address_id': timestamp_var,
                                            'address_name': req.body.address_name,
                                            'address_details': req.body.address_details,
                                            'address_locality': req.body.address_locality_landmark,
                                            'address_pincode': req.body.address_pincode,
                                            'address_state': req.body.address_state,
                                            'address_city': req.body.address_city,
                                            'address_contact': req.body.address_contact_no,
                                            'address_type': req.body.address_type,
                                            'address_default': 'true'
                                        }
                                    }

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


                });


        } else {


            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $push: {
                            'address': {
                                'address_id': timestamp_var,
                                'address_name': req.body.address_name,
                                'address_details': req.body.address_details,
                                'address_locality': req.body.address_locality_landmark,
                                'address_pincode': req.body.address_pincode,
                                'address_state': req.body.address_state,
                                'address_city': req.body.address_city,
                                'address_contact': req.body.address_contact_no,
                                'address_type': req.body.address_type,
                                'address_default': 'false'
                            }
                        }

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

    });


router

    .post('/get-user-address', function (req, res, next) {

        console.log(req.body);

        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id)

        }, function (err, user) {


            if (err) {
                res.status(404);
                res.send('user not find');
            } else {

                res.status(200).json(user);

                console.log(user);
            }
        });
    });


router

    .post('/user-account-update', function (req, res, next) {

        console.log(req.body);
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $set: {
                    email: req.body.user_email,
                    phone: req.body.user_mobile,
                }
            },
            new: true
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            res.status(200);
            res.send(data);
            console.log('user PROFILE UPDATED');
        })
    });




router
    .post('/user-account-deactivate', function (req, res, next) {

        console.log(req.body);


        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id),
            email: req.body.deactivate_user_email,
            phone: req.body.user_mobile
        }, function (err, user) {


            if (err || user == "") {
                res.status(404);
                res.status(404).send('details are incorrect');
            } else {


                if (bcrypt.compareSync(req.body.deactivate_user_password, user[0].password)) {
                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id),


                        },
                        update: {
                            $set: {

                                status: "inactive"
                            }
                        },
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');

                            throw err;

                        }

                        res.status(200).send('acount deactivated');

                    });

                } else {

                    res.status(404).send('password not match');

                }
            }

        });


    });


router
    .post('/user-profile-image-upload', function (req, res, next) {



        // dns.lookup(os.hostname(), function (err, add, fam) {
        //   console.log('addr: '+add);
        // })

        var date = new Date();
        var current_hour = date.getTime();

        var user_id = req.body.user_id;

        var image_name = '192.168.1.157:3000' + '/uploads/' + current_hour + '.jpg';

        fs.writeFile("client/uploads/" + current_hour + ".jpg", new Buffer(req.body.files, "base64"), function (err) {

            if (err) {

                throw err;
            } else {

                db.user_infos.findAndModify({
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $set: {
                            user_profile_image: image_name

                        }
                    },
                    new: true
                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    res.status(200);
                    res.send('User PROFILE IMAGE UPDATED');
                    console.log('User PROFILE IMAGE UPDATED');
                })
                // res.send("success");
                // console.log("success!");
            }

        });

    });

//Getting Details for Logged in users

router
    .post('/get-user-details', function (req, res, next) {

        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id),
        }, function (err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('No user Found');
            } else {

                console.log(user);
                res.status(200).send(user[0]);

            }
        });

    });


router
    .post('/forget-user-password', function (req, res, next) {

        console.log(req.body);
        db.user_infos.find({
            email: req.body.user_email,
        }, function (err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('Email Not Found');
            } else {

                var mailOptions = {
                    from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                    to: req.body.user_email, // list of receivers
                    subject: 'EatoEato Password Reset', // Subject line
                    text: 'Resetting your EatoEato Password', // plain text body
                    html: '<b> Please Click on Below Link to Reset your Account Password</b> <br><br><br> <a href="http://192.168.1.156:3000/#/user_login' + user._id + '">' + randomValueHex(100) + '</a>' // html body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.json({
                            yo: 'error'
                        });
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.json({
                            'status': 'Email Correct',
                            'info': 'Email Sent'
                        });

                    };
                });



            }
        });

    });

router
    .post('/delete-user-address', function (req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $pull: {
                    'address': {
                        'address_id': req.body.address_id
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
            res.status(200).send(data);

        });
    });



// FOR DATE LISTING

router
    .post('/get-cook-listing-by-date', function (req, res, next) {


        console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE



        var listing = [];
        var count = 0;
        var filter_cuisine = [];
        var filter_cuisine_obj = [];

        var filter_occ = [];
        var filter_occ_obj = [];

        var total_cuisine = 0;
        var total_occ = 0;

        var veg_type = [];
        var meal_type = [];

        var price_list = [];
        var price_data = {};

        var time_list = [];
        var time_data = {};

        var filter = {};

        db.cook_infos.find({ isApproved: 'Approved' }, {
            'food_details': 1,
            _id: 0,
            cook_latitude: 1,
            cook_longitude: 1
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }



            var i, j;




            var lt, lt1, ln, ln1, dLat, dLon, a;
            var cook_final_list_coll = [];

            // FINDING ALL COOKS WITHIN USER range

            for (i = 0; i < data.length; i++) {

                if (data[i].food_details.length > 0) {



                    lt = req.body.lat;   // this is User lat
                    lt1 = data[i].cook_latitude;  // this is Cook lat

                    ln = req.body.long;    // this is User long
                    ln1 = data[i].cook_longitude;  // this is Cook long

                    dLat = (lt - lt1) * Math.PI / 180;
                    dLon = (ln - ln1) * Math.PI / 180;
                    a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
                    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



                    if (d <= 3000) {

                        cook_final_list_coll.push(data[i]);

                    }


                }



            }



            var maxDate, minDate, dd, isValidDate;
            var range, pos;
            var dates = [];
            var date_range_false_id = [];
            function stringToDate(_date, _format, _delimiter) {
                var formatLowerCase = _format.toLowerCase();
                var formatItems = formatLowerCase.split(_delimiter);
                var dateItems = _date.split(_delimiter);
                var monthIndex = formatItems.indexOf("mm");
                var dayIndex = formatItems.indexOf("dd");
                var yearIndex = formatItems.indexOf("yyyy");
                var month = parseInt(dateItems[monthIndex]);
                month -= 1;
                var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                return formatedDate;
            }


            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
                    dates = [];
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


                    maxDate = new Date(Math.max.apply(null, dates));
                    minDate = new Date(Math.min.apply(null, dates));

                    range = moment_r.range(minDate, maxDate);

                    dd = moment(new Date(stringToDate(req.body.date, "dd-MM-yyyy", "-")));  // THIS IS CURRENT DATE
                    isValidDate = dd.within(range);



                    if (isValidDate == false) {

                        //  cook_final_list_coll.splice(i,1);
                        //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
                        date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
                    }
                    if (isValidDate == true) {

                        // console.log('VALID RANGE');
                    }


                }

            }   // END


            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            var lat_long_coll = [];
            var lat_long_obj = {};

            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY

            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

                    if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved') {

                        lat_long_obj = {};
                        lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
                        lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

                        lat_long_coll.push(lat_long_obj);
                        listing[count] = cook_final_list_coll[i].food_details[j];


                        count++;
                    }



                }


                // filter.listing=listing;
                //   console.log(listing);

            }  //END

            // REMOVING LISTING FOOD IF DATE RANGE false

            if (date_range_false_id.length > 0) {


                for (var i = 0; i < date_range_false_id.length; i++) {

                    for (var j = 0; j < listing.length; j++) {

                        if (date_range_false_id[i] == listing[j]._id) {

                            listing.splice(j, 1);

                        }
                    }


                }



            }
            console.log(date_range_false_id);
            console.log(listing);

            // END

            var c = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].cuisine_list.length; j++) {

                    if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

                        filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                        filter_cuisine_obj[c] = listing[i].cuisine_list[j];
                        c++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }

            var o = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].occassion_list.length; j++) {

                    if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

                        filter_occ.push(listing[i].occassion_list[j].group_attr);
                        filter_occ_obj[o] = listing[i].occassion_list[j];
                        o++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }
            var i, j;
            for (i = 0; i < listing.length; i++) {

                if (veg_type.length < 1) {

                    veg_type.push({
                        'veg_type': listing[i].food_type
                    });

                } else {



                    for (j = 0; j < veg_type.length; j++) {

                        if (veg_type[j].veg_type == listing[i].food_type) {
                            break;
                        } else {
                            veg_type.push({
                                'veg_type': listing[i].food_type
                            });
                        }

                    }
                }

            }

            for (i = 0; i < listing.length; i++) {


                price_list.push(parseInt(listing[i].food_price_per_plate));
            }

            var min = Math.min.apply(null, price_list);
            var max = Math.max.apply(null, price_list);

            price_data.min_price = min;
            price_data.max_price = max;


            //For Getting min hours and max hours


            var temp_time;
            var temp_fist_two;
            var temp_last_two;
            var am_pm;

            for (i = 0; i < listing.length; i++) {


                if (listing[i].available_hours.hasOwnProperty('sun_from') && listing[i].available_hours.sun_from != "") {


                    temp_fist_two = listing[i].available_hours.sun_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.sun_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sun_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);

                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));


                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('mon_from') && listing[i].available_hours.mon_from != "") {

                    temp_fist_two = listing[i].available_hours.mon_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.mon_from

                    if (temp_last_two == "PM") {

                        temp_time = parseInt(listing[i].available_hours.mon_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.mon_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                }
                if (listing[i].available_hours.hasOwnProperty('tue_from') && listing[i].available_hours.tue_from != "") {

                    temp_fist_two = listing[i].available_hours.tue_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.tue_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1);

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.tue_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('wed_from') && listing[i].available_hours.wed_from != "") {

                    temp_fist_two = listing[i].available_hours.wed_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.wed_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.wed_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    time_list.push(temp_time);
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('thu_from') && listing[i].available_hours.thu_from != "") {

                    temp_fist_two = listing[i].available_hours.thu_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.thu_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('fri_from') && listing[i].available_hours.fri_from != "") {

                    temp_fist_two = listing[i].available_hours.fri_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.fri_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.fri_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('sat_from') && listing[i].available_hours.sat_from != "") {

                    temp_fist_two = listing[i].available_hours.sat_from.slice(0, 2);
                    temp_last_two = temp_fist_two.slice(-2);
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sat_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    time_list.push(temp_time);
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.sat_from.slice(0, 2)));
                }

                if (listing[i].available_hours.hasOwnProperty('sun_to') && listing[i].available_hours.sun_to != "") {

                    temp_fist_two = listing[i].available_hours.sun_to.slice(0, 2);
                    temp_last_two = temp_fist_two.slice(-2);
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sun_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.sun_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('mon_to') && listing[i].available_hours.mon_to != "") {


                    temp_fist_two = listing[i].available_hours.mon_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.mon_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    console.log(temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1));
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.mon_to.slice(0, 2)) + 12;

                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);


                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.mon_to.slice(0, 2)));
                    }

                }
                if (listing[i].available_hours.hasOwnProperty('tue_to') && listing[i].available_hours.tue_to != "") {

                    temp_fist_two = listing[i].available_hours.tue_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.tue_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {



                        temp_time = parseInt(listing[i].available_hours.tue_to.slice(0, 2)) + 12;


                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.tue_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                }
                if (listing[i].available_hours.hasOwnProperty('wed_to') && listing[i].available_hours.wed_to != "") {

                    temp_fist_two = listing[i].available_hours.wed_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.wed_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.wed_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('thu_to') && listing[i].available_hours.thu_to != "") {

                    temp_fist_two = listing[i].available_hours.thu_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.thu_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //   time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('fri_to') && listing[i].available_hours.fri_to != "") {

                    temp_fist_two = listing[i].available_hours.fri_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.fri_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.fri_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //    time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('sat_to') && listing[i].available_hours.sat_to != "") {

                    temp_fist_two = listing[i].available_hours.sat_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sat_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
                }

            }


            time_list = time_list.filter(x => {
                return x != undefined;
            })
            var min = Math.min.apply(null, time_list);
            var max = Math.max.apply(null, time_list);

            console.log(time_list);
            time_data.min_time = min;
            time_data.max_time = max;


            filter.listing = listing;
            filter.cuisine_list = filter_cuisine_obj;
            filter.occasion_list = filter_occ_obj;
            filter.veg_type = veg_type;
            filter.price_data = price_data;
            filter.time_data = time_data;
            filter.food_count = listing.length;
            filter.lat_long_coll = lat_long_coll;
            myCache.set("myKey", listing, 0, function (err, success) {
                if (!err && success) {

                    // true
                    // ... do something ...
                }
            });


            res.status(200).send(filter);

        });
    });




router
    .post('/get-listing-foods', function (req, res, next) {

        console.log('LISTING FOODS');
        console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE
        console.log('THIS IS CURR DAY');
        //  var dt = new Date();
        //              var curr_hour = dt.toString("HH:mm");
        //          console.log(curr_hour);


        var listing = [];
        var count = 0;
        var filter_cuisine = [];
        var filter_cuisine_obj = [];

        var filter_occ = [];
        var filter_occ_obj = [];

        var total_cuisine = 0;
        var total_occ = 0;

        var veg_type = [];
        var meal_type = [];

        var price_list = [];
        var price_data = {};

        var time_list = [];
        var time_data = {};

        var filter = {};

        db.cook_infos.find({ isApproved: 'Approved' }, {
            'food_details': 1,
            _id: 0,
            cook_latitude: 1,
            cook_longitude: 1
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }



            var i, j;




            var lt, lt1, ln, ln1, dLat, dLon, a;
            var cook_final_list_coll = [];

            // FINDING ALL COOKS WITHIN USER range

            for (i = 0; i < data.length; i++) {

                if (data[i].food_details.length > 0) {



                    lt = req.body.lat;   // this is User lat
                    lt1 = data[i].cook_latitude;  // this is Cook lat

                    ln = req.body.long;    // this is User long
                    ln1 = data[i].cook_longitude;  // this is Cook long

                    dLat = (lt - lt1) * Math.PI / 180;
                    dLon = (ln - ln1) * Math.PI / 180;
                    a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
                    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



                    if (d <= 3000) {

                        cook_final_list_coll.push(data[i]);

                    }


                }



            }



            var maxDate, minDate, dd, isValidDate;
            var range, pos;
            var dates = [];
            var date_range_false_id = [];
            function stringToDate(_date, _format, _delimiter) {
                var formatLowerCase = _format.toLowerCase();
                var formatItems = formatLowerCase.split(_delimiter);
                var dateItems = _date.split(_delimiter);
                var monthIndex = formatItems.indexOf("mm");
                var dayIndex = formatItems.indexOf("dd");
                var yearIndex = formatItems.indexOf("yyyy");
                var month = parseInt(dateItems[monthIndex]);
                month -= 1;
                var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                return formatedDate;
            }


            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
                    dates = [];
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


                    maxDate = new Date(Math.max.apply(null, dates));
                    minDate = new Date(Math.min.apply(null, dates));

                    range = moment_r.range(minDate, maxDate);

                    dd = moment();  // THIS IS CURRENT DATE
                    isValidDate = dd.within(range);


                    if (isValidDate == false) {

                        //  cook_final_list_coll.splice(i,1);
                        //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
                        date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
                    }
                    if (isValidDate == true) {

                        // console.log('VALID RANGE');
                    }


                }

            }   // END



            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            var lat_long_coll = [];
            var lat_long_obj = {};

            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY

            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

                    if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved') {

                        lat_long_obj = {};
                        lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
                        lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

                        lat_long_coll.push(lat_long_obj);
                        listing[count] = cook_final_list_coll[i].food_details[j];


                        count++;
                    }



                }


                // filter.listing=listing;
                //   console.log(listing);

            }  //END

            // REMOVING LISTING FOOD IF DATE RANGE false

            if (date_range_false_id.length > 0) {


                for (var i = 0; i < date_range_false_id.length; i++) {

                    for (var j = 0; j < listing.length; j++) {

                        if (date_range_false_id[i] == listing[j]._id) {

                            listing.splice(j, 1);

                        }
                    }


                }



            }

            // END

            var c = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].cuisine_list.length; j++) {

                    if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

                        filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                        filter_cuisine_obj[c] = listing[i].cuisine_list[j];
                        c++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }

            var o = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].occassion_list.length; j++) {

                    if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

                        filter_occ.push(listing[i].occassion_list[j].group_attr);
                        filter_occ_obj[o] = listing[i].occassion_list[j];
                        o++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }
            var i, j;
            for (i = 0; i < listing.length; i++) {

                if (veg_type.length < 1) {

                    veg_type.push({
                        'veg_type': listing[i].food_type
                    });

                } else {



                    for (j = 0; j < veg_type.length; j++) {

                        if (veg_type[j].veg_type == listing[i].food_type) {
                            break;
                        } else {
                            veg_type.push({
                                'veg_type': listing[i].food_type
                            });
                        }

                    }
                }

            }

            for (i = 0; i < listing.length; i++) {


                price_list.push(parseInt(listing[i].food_price_per_plate));
            }

            var min = Math.min.apply(null, price_list);
            var max = Math.max.apply(null, price_list);

            price_data.min_price = min;
            price_data.max_price = max;


            //For Getting min hours and max hours


            var temp_time;
            var temp_fist_two;
            var temp_last_two;
            var am_pm;

            for (i = 0; i < listing.length; i++) {


                if (listing[i].available_hours.hasOwnProperty('sun_from') && listing[i].available_hours.sun_from != "") {


                    temp_fist_two = listing[i].available_hours.sun_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.sun_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sun_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);

                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));


                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('mon_from') && listing[i].available_hours.mon_from != "") {

                    temp_fist_two = listing[i].available_hours.mon_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.mon_from

                    if (temp_last_two == "PM") {

                        temp_time = parseInt(listing[i].available_hours.mon_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.mon_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                }
                if (listing[i].available_hours.hasOwnProperty('tue_from') && listing[i].available_hours.tue_from != "") {

                    temp_fist_two = listing[i].available_hours.tue_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.tue_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1);

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.tue_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('wed_from') && listing[i].available_hours.wed_from != "") {

                    temp_fist_two = listing[i].available_hours.wed_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.wed_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.wed_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    time_list.push(temp_time);
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('thu_from') && listing[i].available_hours.thu_from != "") {

                    temp_fist_two = listing[i].available_hours.thu_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.thu_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('fri_from') && listing[i].available_hours.fri_from != "") {

                    temp_fist_two = listing[i].available_hours.fri_from.slice(0, 2);
                    temp_last_two = listing[i].available_hours.fri_from;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.fri_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('sat_from') && listing[i].available_hours.sat_from != "") {

                    temp_fist_two = listing[i].available_hours.sat_from.slice(0, 2);
                    temp_last_two = temp_fist_two.slice(-2);
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sat_from.slice(0, 2)) + 12;
                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    time_list.push(temp_time);
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //  time_list.push(parseInt(listing[i].available_hours.sat_from.slice(0, 2)));
                }

                if (listing[i].available_hours.hasOwnProperty('sun_to') && listing[i].available_hours.sun_to != "") {

                    temp_fist_two = listing[i].available_hours.sun_to.slice(0, 2);
                    temp_last_two = temp_fist_two.slice(-2);
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sun_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.sun_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('mon_to') && listing[i].available_hours.mon_to != "") {


                    temp_fist_two = listing[i].available_hours.mon_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.mon_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
                    console.log(temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1));
                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.mon_to.slice(0, 2)) + 12;

                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);


                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.mon_to.slice(0, 2)));
                    }

                }
                if (listing[i].available_hours.hasOwnProperty('tue_to') && listing[i].available_hours.tue_to != "") {

                    temp_fist_two = listing[i].available_hours.tue_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.tue_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {



                        temp_time = parseInt(listing[i].available_hours.tue_to.slice(0, 2)) + 12;


                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.tue_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                }
                if (listing[i].available_hours.hasOwnProperty('wed_to') && listing[i].available_hours.wed_to != "") {

                    temp_fist_two = listing[i].available_hours.wed_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.wed_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.wed_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('thu_to') && listing[i].available_hours.thu_to != "") {

                    temp_fist_two = listing[i].available_hours.thu_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.thu_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //   time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('fri_to') && listing[i].available_hours.fri_to != "") {

                    temp_fist_two = listing[i].available_hours.fri_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.fri_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.fri_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    //    time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
                }
                if (listing[i].available_hours.hasOwnProperty('sat_to') && listing[i].available_hours.sat_to != "") {

                    temp_fist_two = listing[i].available_hours.sat_to.slice(0, 2);
                    temp_last_two = listing[i].available_hours.thu_to;
                    am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

                    if (am_pm == "PM") {

                        temp_time = parseInt(listing[i].available_hours.sat_to.slice(0, 2)) + 12;
                        if (temp_time == 24) {
                            temp_time = temp_time - 12;
                        }

                        time_list.push(temp_time);
                    }
                    else {
                        time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
                    }
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));

                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                    // time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
                }

            }


            time_list = time_list.filter(x => {
                return x != undefined;
            })
            var min = Math.min.apply(null, time_list);
            var max = Math.max.apply(null, time_list);

            console.log(time_list);
            time_data.min_time = min;
            time_data.max_time = max;


            filter.listing = listing;
            filter.cuisine_list = filter_cuisine_obj;
            filter.occasion_list = filter_occ_obj;
            filter.veg_type = veg_type;
            filter.price_data = price_data;
            filter.time_data = time_data;
            filter.food_count = listing.length;
            filter.lat_long_coll = lat_long_coll;
            myCache.set("myKey", listing, 0, function (err, success) {
                if (!err && success) {

                    // true
                    // ... do something ...
                }
            });


            res.status(200).send(filter);

        });
    });



// router
//     .post('/get-listing-foods', function (req, res, next) {

//         console.log('LISTING FOODS');
//         console.log('THIS IS CURRENT DATE');
//          var dt = new Date();
//             var curr_hour = dt.getHours();
//         console.log(curr_hour);
//         console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE
// // NOTE PENDING:- For Time Filters We Have To Calculate min time and max time acc to today day (using current day )


//         var listing = [];
//         var count = 0;
//         var filter_cuisine = [];
//         var filter_cuisine_obj = [];

//         var filter_occ = [];
//         var filter_occ_obj = [];

//         var total_cuisine = 0;
//         var total_occ = 0;

//         var veg_type = [];
//         var meal_type = [];

//         var price_list = [];
//         var price_data = {};

//         var time_list = [];
//         var time_data = {};

//         var filter = {};

//         db.cook_infos.find({ isApproved: 'Approved' }, {
//             'food_details': 1,
//             _id: 0,
//             cook_latitude: 1,
//             cook_longitude: 1
//         }, function (err, data, lastErrorObject) {
//             if (err) {
//                 res.status(400);
//                 res.send('error');
//                 console.log(err);

//                 throw err;

//             }



//             var i, j;




//             var lt, lt1, ln, ln1, dLat, dLon, a;
//             var cook_final_list_coll = [];

//             // FINDING ALL COOKS WITHIN USER range

//             for (i = 0; i < data.length; i++) {

//                 if (data[i].food_details.length > 0) {



//                     lt = req.body.lat;   // this is User lat
//                     lt1 = data[i].cook_latitude;  // this is Cook lat

//                     ln = req.body.long;    // this is User long
//                     ln1 = data[i].cook_longitude;  // this is Cook long

//                     dLat = (lt - lt1) * Math.PI / 180;
//                     dLon = (ln - ln1) * Math.PI / 180;
//                     a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
//                     d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



//                     if (d <= 3000) {

//                         cook_final_list_coll.push(data[i]);

//                     }


//                 }



//             }



//             var maxDate, minDate, dd, isValidDate;
//             var range, pos;
//             var dates = [];
//             var date_range_false_id = [];
//             function stringToDate(_date, _format, _delimiter) {
//                 var formatLowerCase = _format.toLowerCase();
//                 var formatItems = formatLowerCase.split(_delimiter);
//                 var dateItems = _date.split(_delimiter);
//                 var monthIndex = formatItems.indexOf("mm");
//                 var dayIndex = formatItems.indexOf("dd");
//                 var yearIndex = formatItems.indexOf("yyyy");
//                 var month = parseInt(dateItems[monthIndex]);
//                 month -= 1;
//                 var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
//                 return formatedDate;
//             }


//             for (var i = 0; i < cook_final_list_coll.length; i++) {

//                 for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
//                     dates = [];
//                     dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
//                     dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


//                     maxDate = new Date(Math.max.apply(null, dates));
//                     minDate = new Date(Math.min.apply(null, dates));

//                     range = moment_r.range(minDate, maxDate);

//                     dd = moment();  // THIS IS CURRENT DATE
//                     isValidDate = dd.within(range);


//                     if (isValidDate == false) {

//                         //  cook_final_list_coll.splice(i,1);
//                         //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
//                         date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
//                     }
//                     if (isValidDate == true) {

//                         // console.log('VALID RANGE');
//                     }


//                 }

//             }   // END



//             // COLLECT ALL COOK LATITUDE AND LONGITUDE

//             var lat_long_coll = [];
//             var lat_long_obj = {};

//             // COLLECT ALL COOK LATITUDE AND LONGITUDE

//             // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY
//             var dt = new Date();
//             var curr_hour = dt.getHours();
//             var cur_ampm = (curr_hour >= 12) ? "PM" : "AM";

//             var db_from_am_pm;
//             var db_to_am_pm;
//             var db_time_from;
//             var db_time_to;
//     console.log("THIS IS CURR HOUR BEFORE");
//                             console.log(curr_hour);
//             var curr_day_for_match = dt.toString().toLowerCase().substring(0, 3) + "_from";
//             var curr_day_for_match_to = dt.toString().toLowerCase().substring(0, 3) + "_to";

//             // if (cur_ampm == "PM" && curr_hour != 12) {
//             //     console.log('THIS IS HOUR CHECK');
//             //     curr_hour = curr_hour + 12;

//             // }
//              console.log("THIS IS CURR HOUR 111");
//                             console.log(curr_hour);
//             for (var i = 0; i < cook_final_list_coll.length; i++) {

//                 for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

//                     if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved' && cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match] != "") {


//                         db_from_am_pm = cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].substr(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].length - 2)
//                         db_to_am_pm = cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].substr(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].length - 2)
//                         db_time_from = parseInt(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].substr(0, 2));
//                         db_time_to = parseInt(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].substr(0, 2));

//                         if (db_from_am_pm == "PM" && db_time_from !=12) {
//                             db_time_from = db_time_from + 12;
//                         }
//                         if (db_to_am_pm == "PM" && db_time_to !=12 ) {
//                             db_time_to = db_time_to + 12;
//                         }


//                         if (db_time_from <= curr_hour && db_time_to >= curr_hour) {

//                             console.log('THIS CURR DB AM PM FROM');
//                             console.log(db_time_from);
//                             console.log(db_time_to);
//                             console.log("THIS IS CURR HOUR");
//                             console.log(curr_hour);


//                             lat_long_obj = {};
//                             lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
//                             lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

//                             lat_long_coll.push(lat_long_obj);
//                             listing[count] = cook_final_list_coll[i].food_details[j];   // THIS  IS FINAL LISTING


//                             count++;

//                         }


//                     }



//                 }


//                 // filter.listing=listing;
//                 //   console.log(listing);

//             }  //END

//             // REMOVING LISTING FOOD IF DATE RANGE false

//             if (date_range_false_id.length > 0) {


//                 for (var i = 0; i < date_range_false_id.length; i++) {

//                     for (var j = 0; j < listing.length; j++) {

//                         if (date_range_false_id[i] == listing[j]._id) {

//                             listing.splice(j, 1);

//                         }
//                     }


//                 }



//             }

//             // END

//             var c = 0;
//             for (var i = 0; i < listing.length; i++) {

//                 for (j = 0; j < listing[i].cuisine_list.length; j++) {

//                     if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

//                         filter_cuisine.push(listing[i].cuisine_list[j].category_name);
//                         filter_cuisine_obj[c] = listing[i].cuisine_list[j];
//                         c++;
//                         // filter.filter_cuisine=filter_cuisine;
//                         //    total_cuisine++;
//                         // filter.total_cuisine=total_cuisine;



//                     }

//                 }
//             }

//             var o = 0;
//             for (var i = 0; i < listing.length; i++) {

//                 for (j = 0; j < listing[i].occassion_list.length; j++) {

//                     if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

//                         filter_occ.push(listing[i].occassion_list[j].group_attr);
//                         filter_occ_obj[o] = listing[i].occassion_list[j];
//                         o++;
//                         // filter.filter_cuisine=filter_cuisine;
//                         //    total_cuisine++;
//                         // filter.total_cuisine=total_cuisine;



//                     }

//                 }
//             }
//             var i, j;
//             for (i = 0; i < listing.length; i++) {

//                 if (veg_type.length < 1) {

//                     veg_type.push({
//                         'veg_type': listing[i].food_type
//                     });

//                 } else {



//                     for (j = 0; j < veg_type.length; j++) {

//                         if (veg_type[j].veg_type == listing[i].food_type) {
//                             break;
//                         } else {
//                             veg_type.push({
//                                 'veg_type': listing[i].food_type
//                             });
//                         }

//                     }
//                 }

//             }

//             for (i = 0; i < listing.length; i++) {


//                 price_list.push(parseInt(listing[i].food_price_per_plate));
//             }

//             var min = Math.min.apply(null, price_list);
//             var max = Math.max.apply(null, price_list);

//             price_data.min_price = min;
//             price_data.max_price = max;


//             //For Getting min hours and max hours


//             var temp_time;
//             var temp_fist_two;
//             var temp_last_two;
//             var am_pm;

//             for (i = 0; i < listing.length; i++) {


//                 if (listing[i].available_hours.hasOwnProperty('sun_from') && listing[i].available_hours.sun_from != "") {


//                     temp_fist_two = listing[i].available_hours.sun_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.sun_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sun_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);

//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));


//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('mon_from') && listing[i].available_hours.mon_from != "") {

//                     temp_fist_two = listing[i].available_hours.mon_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.mon_from

//                     if (temp_last_two == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.mon_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.mon_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('tue_from') && listing[i].available_hours.tue_from != "") {

//                     temp_fist_two = listing[i].available_hours.tue_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.tue_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1);

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.tue_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('wed_from') && listing[i].available_hours.wed_from != "") {

//                     temp_fist_two = listing[i].available_hours.wed_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.wed_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.wed_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     time_list.push(temp_time);
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('thu_from') && listing[i].available_hours.thu_from != "") {

//                     temp_fist_two = listing[i].available_hours.thu_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.thu_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('fri_from') && listing[i].available_hours.fri_from != "") {

//                     temp_fist_two = listing[i].available_hours.fri_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.fri_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.fri_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('sat_from') && listing[i].available_hours.sat_from != "") {

//                     temp_fist_two = listing[i].available_hours.sat_from.slice(0, 2);
//                     temp_last_two = temp_fist_two.slice(-2);
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sat_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     time_list.push(temp_time);
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.sat_from.slice(0, 2)));
//                 }

//                 if (listing[i].available_hours.hasOwnProperty('sun_to') && listing[i].available_hours.sun_to != "") {

//                     temp_fist_two = listing[i].available_hours.sun_to.slice(0, 2);
//                     temp_last_two = temp_fist_two.slice(-2);
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sun_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.sun_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('mon_to') && listing[i].available_hours.mon_to != "") {


//                     temp_fist_two = listing[i].available_hours.mon_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.mon_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     console.log(temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1));
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.mon_to.slice(0, 2)) + 12;

//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);


//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.mon_to.slice(0, 2)));
//                     }

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('tue_to') && listing[i].available_hours.tue_to != "") {

//                     temp_fist_two = listing[i].available_hours.tue_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.tue_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {



//                         temp_time = parseInt(listing[i].available_hours.tue_to.slice(0, 2)) + 12;


//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.tue_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('wed_to') && listing[i].available_hours.wed_to != "") {

//                     temp_fist_two = listing[i].available_hours.wed_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.wed_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.wed_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('thu_to') && listing[i].available_hours.thu_to != "") {

//                     temp_fist_two = listing[i].available_hours.thu_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.thu_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //   time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('fri_to') && listing[i].available_hours.fri_to != "") {

//                     temp_fist_two = listing[i].available_hours.fri_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.fri_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.fri_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //    time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('sat_to') && listing[i].available_hours.sat_to != "") {

//                     temp_fist_two = listing[i].available_hours.sat_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sat_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
//                 }

//             }


//             time_list = time_list.filter(x => {
//                 return x != undefined;
//             })
//             var min = Math.min.apply(null, time_list);
//             var max = Math.max.apply(null, time_list);

//             console.log(time_list);
//             time_data.min_time = min;
//             time_data.max_time = max;


//             filter.listing = listing;
//             filter.cuisine_list = filter_cuisine_obj;
//             filter.occasion_list = filter_occ_obj;
//             filter.veg_type = veg_type;
//             filter.price_data = price_data;
//             filter.time_data = time_data;
//             filter.food_count = listing.length;
//             filter.lat_long_coll = lat_long_coll;
//             myCache.set("myKey", listing, 0, function (err, success) {
//                 if (!err && success) {

//                     // true
//                     // ... do something ...
//                 }
//             });


//             res.status(200).send(filter);

//         });
//     });



router
    .post('/filter-cook-listing', function (req, res, next) {
        var filtered_data = [];
        var dates = [];


        console.log(req.body);
        // res.send({'val':'asfd'});
        myCache.get("myKey", function (err, value) {
            if (!err) {
                if (value == undefined) {
                    console.log('key not found');
                } else {

                    var len = req.body.length;
                    console.log(len);

                    for (var i = 0; i < len; i++) {

                        if (req.body[i].category_name) {

                            var tt = _.filter(value, function (data) {

                                return _.some(data.cuisine_list, {
                                    category_name: req.body[i].category_name,
                                    'status': 'true'
                                });


                            });


                            for (j = 0; j < tt.length; j++) {
                                var count = 0;

                                if (filtered_data.length < 1) {
                                    filtered_data.push(tt[j]);
                                } else {

                                    for (k = 0; k < filtered_data.length; k++) {

                                        if (filtered_data[k]._id == tt[j]._id) {
                                            count = 1;
                                            break;

                                        }

                                    }
                                    if (count != 1) {
                                        filtered_data.push(tt[j]);

                                    }
                                    count = 0;
                                }

                            }

                        }
                        if (req.body[i].group_attr) {

                            console.log('THIS IS FILTERED ONE');

                            if (filtered_data != "") {

                                var tt = _.filter(filtered_data, function (data) {


                                    return _.some(data.occassion_list, {
                                        group_attr: req.body[i].group_attr,
                                        'status': 'true'
                                    });


                                });
                                filtered_data = [];
                                for (j = 0; j < tt.length; j++) {

                                    filtered_data.push(tt[j]);


                                }

                            } else {
                                var tt = _.filter(value, function (data) {

                                    return _.some(data.occassion_list, {
                                        group_attr: req.body[i].group_attr,
                                        'status': 'true'
                                    });


                                });
                                //        console.log(tt);
                                for (j = 0; j < tt.length; j++) {
                                    var count = 0;

                                    if (filtered_data.length < 1) {
                                        filtered_data.push(tt[j]);
                                    } else {

                                        for (k = 0; k < filtered_data.length; k++) {

                                            if (filtered_data[k]._id == tt[j]._id) {
                                                count = 1;
                                                break;

                                            }

                                        }
                                        if (count != 1) {
                                            filtered_data.push(tt[j]);

                                        }
                                        count = 0;
                                    }

                                }
                            }
                            // console.log('this is group attr');


                        }

                        if (req.body[i].veg_type) {

                            //  console.log(filtered_data);
                            console.log(req.body[i].veg_type);
                            if (filtered_data != "") {


                                var tt = _.filter(filtered_data, {
                                    'food_type': req.body[i].veg_type
                                });


                                filtered_data = [];

                                for (j = 0; j < tt.length; j++) {

                                    filtered_data.push(tt[j]);


                                }

                            } else {
                                var tt = _.filter(value, {
                                    'food_type': req.body[i].veg_type
                                });
                                //        console.log(tt);
                                for (j = 0; j < tt.length; j++) {
                                    var count = 0;

                                    if (filtered_data.length < 1) {
                                        filtered_data.push(tt[j]);
                                    } else {

                                        for (k = 0; k < filtered_data.length; k++) {

                                            if (filtered_data[k]._id == tt[j]._id) {
                                                count = 1;
                                                break;

                                            }

                                        }
                                        if (count != 1) {
                                            filtered_data.push(tt[j]);

                                        }
                                        count = 0;
                                    }

                                }
                            }


                        }

                        // if (req.body[i].date) {

                        //     if (filtered_data != "") {

                        //         dates = [];
                        //         var incoming_date = new Date(req.body[i].date);


                        //         for (var j = 0; j < value.length; j++) {

                        //             dates.push(new Date(value[j].selected_date_from));
                        //             dates.push(new Date(value[j].selected_date_to));
                        //         }

                        //         var maxDate = new Date(Math.max.apply(null, dates));
                        //         var minDate = new Date(Math.min.apply(null, dates));

                        //         const range = moment_r.range(minDate, maxDate);
                        //         var v = range.contains(incoming_date);


                        //         if (v == true) {



                        //         } else if (v == false) {
                        //             filtered_data = [];

                        //         }


                        //     } else {
                        //         filtered_data = value;
                        //     }


                        // } //main if ends

                        if (req.body[i].min_price) {



                            if (filtered_data != "") {
                                var arr = [];
                                for (k = 0; k < filtered_data.length; k++) {

                                    // console.log(parseInt(filtered_data[k].food_price_per_plate));      
                                    if (parseInt(filtered_data[k].food_price_per_plate) >= req.body[i].min_price && parseInt(filtered_data[k].food_price_per_plate) <= req.body[i].max_price) {


                                        arr.push(filtered_data[k]);

                                        console.log('FOOD FOUND');
                                    } else {

                                    }
                                }

                                filtered_data = arr;

                            } else {
                                var arr = [];
                                for (k = 0; k < value.length; k++) {

                                    // console.log(parseInt(filtered_data[k].food_price_per_plate));      
                                    if (parseInt(value[k].food_price_per_plate) >= req.body[i].min_price && parseInt(value[k].food_price_per_plate) <= req.body[i].max_price) {


                                        arr.push(value[k]);

                                        console.log('FOOD FOUND');
                                    } else {

                                    }
                                }

                                filtered_data = arr;
                            }


                        }

                        if (req.body[i].min_time || req.body[i].max_time) {

                            if (filtered_data != "") {

                                console.log('COME TO FILTERED DATA');

                                var arr = [];
                                var dt = moment(new Date(), "YYYY-MM-DD HH:mm:ss"); //IT SHOULD BE CURRENT DATE AND CHANGABLE ACC TO USER
                                var day = dt.format('dddd').slice(0, 3).toLowerCase().concat('_from');
                                var dte;

                                var temp_fist_two_from;
                                var temp_fist_two_to;

                                var temp_last_from;
                                var temp_last_to;

                                var temp_time_to;
                                var am_pm_from;
                                var am_pm_to;

                                //   console.log(day);
                                console.log('this is value length');
                                console.log(value);
                                console.log(req.body);
                                console.log('ABOVE IS BODY');
                                for (var j = 0; j < filtered_data.length; j++) {


                                    if (day == "mon_from") {

                                        if (filtered_data[j].available_hours.mon_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.mon_from;
                                            temp_last_to = filtered_data[j].available_hours.mon_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.mon_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.mon_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.mon_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.mon_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }
                                    if (day == "tue_from") {

                                        console.log('this is tuesday');
                                        if (filtered_data[j].available_hours.tue_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.tue_from;
                                            temp_last_to = filtered_data[j].available_hours.tue_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.tue_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.tue_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.tue_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.tue_to.slice(0, 2))
                                            }




                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }


                                    if (day == "wed_from") {

                                        if (filtered_data[j].available_hours.wed_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.wed_from;
                                            temp_last_to = filtered_data[j].available_hours.wed_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.wed_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.wed_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.wed_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.wed_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "thu_from") {

                                        if (filtered_data[j].available_hours.thu_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.thu_from;
                                            temp_last_to = filtered_data[j].available_hours.thu_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.thu_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.thu_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.thu_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.thu_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }


                                    if (day == "fri_from") {

                                        if (filtered_data[j].available_hours.fri_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.fri_from;
                                            temp_last_to = filtered_data[j].available_hours.fri_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.fri_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.fri_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.fri_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.fri_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }


                                    if (day == "sat_from") {

                                        if (filtered_data[j].available_hours.sat_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.sat_from;
                                            temp_last_to = filtered_data[j].available_hours.sat_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.sat_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.sat_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.sat_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.sat_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }


                                    if (day == "sun_from") {

                                        if (filtered_data[j].available_hours.mon_from != "") {


                                            temp_last_from = filtered_data[j].available_hours.sun_from;
                                            temp_last_to = filtered_data[j].available_hours.sun_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.sun_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(filtered_data[j].available_hours.sun_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.sun_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(filtered_data[j].available_hours.sun_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(filtered_data[j]);

                                            }


                                        }

                                    }





                                }

                                filtered_data = arr;


                            }
                            else {


                                var arr = [];
                                var dt = moment(new Date(), "YYYY-MM-DD HH:mm:ss"); //IT SHOULD BE CURRENT DATE AND CHANGABLE ACC TO USER
                                var day = dt.format('dddd').slice(0, 3).toLowerCase().concat('_from');
                                var dte;

                                var temp_fist_two_from;
                                var temp_fist_two_to;

                                var temp_last_from;
                                var temp_last_to;

                                var temp_time_to;
                                var am_pm_from;
                                var am_pm_to;

                                //   console.log(day);
                                console.log('this is value length');
                                console.log(value);
                                console.log(req.body);
                                console.log('ABOVE IS BODY');
                                for (var j = 0; j < value.length; j++) {


                                    if (day == "mon_from") {

                                        if (value[j].available_hours.mon_from != "") {


                                            temp_last_from = value[j].available_hours.mon_from;
                                            temp_last_to = value[j].available_hours.mon_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.mon_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.mon_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.mon_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.mon_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }
                                    if (day == "tue_from") {

                                        console.log('this is tuesday');
                                        if (value[j].available_hours.tue_from != "") {


                                            temp_last_from = value[j].available_hours.tue_from;
                                            temp_last_to = value[j].available_hours.tue_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.tue_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.tue_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.tue_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.tue_to.slice(0, 2))
                                            }


                                            console.log('FRONT');

                                            console.log(temp_fist_two_from);
                                            console.log(temp_fist_two_to);

                                            console.log('BELOW');
                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "wed_from") {

                                        if (value[j].available_hours.wed_from != "") {


                                            temp_last_from = value[j].available_hours.wed_from;
                                            temp_last_to = value[j].available_hours.wed_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.wed_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.wed_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.wed_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.wed_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "thu_from") {

                                        if (value[j].available_hours.thu_from != "") {


                                            temp_last_from = value[j].available_hours.thu_from;
                                            temp_last_to = value[j].available_hours.thu_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.thu_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.thu_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.thu_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.thu_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "fri_from") {

                                        if (value[j].available_hours.fri_from != "") {


                                            temp_last_from = value[j].available_hours.fri_from;
                                            temp_last_to = value[j].available_hours.fri_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.fri_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.fri_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.fri_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.fri_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "sat_from") {

                                        if (value[j].available_hours.sat_from != "") {


                                            temp_last_from = value[j].available_hours.sat_from;
                                            temp_last_to = value[j].available_hours.sat_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.sat_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.sat_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.sat_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.sat_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }


                                    if (day == "sun_from") {

                                        if (value[j].available_hours.mon_from != "") {


                                            temp_last_from = value[j].available_hours.sun_from;
                                            temp_last_to = value[j].available_hours.sun_to;

                                            am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);
                                            am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                                            if (am_pm_from == "PM") {
                                                temp_fist_two_from = parseInt(value[j].available_hours.sun_from.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_from = parseInt(value[j].available_hours.sun_from.slice(0, 2));
                                            }
                                            if (am_pm_to == "PM") {
                                                temp_fist_two_to = parseInt(value[j].available_hours.sun_to.slice(0, 2)) + 12;


                                            }
                                            else {
                                                temp_fist_two_to = parseInt(value[j].available_hours.sun_to.slice(0, 2))
                                            }



                                            if ((temp_fist_two_from > req.body[i].min_time || temp_fist_two_from == req.body[i].min_time) && (temp_fist_two_to <= req.body[i].max_time) || temp_fist_two_to == req.body[i].max_time) {

                                                arr.push(value[j]);

                                            }


                                        }

                                    }





                                }

                                filtered_data = arr;
                            }

                        }

                    }


                    console.log(filtered_data.length);
                    res.send(filtered_data);
                    // var filtered = _.filter(value, {"food_name": "Palak Paneer"});
                    // console.log(value);
                    // res.send(value);
                    // var len=value.length;
                    // for(var i=0;i<len;i++){

                    //     if(value[i].food_name=="Palak Paneer"){
                    //         console.log('FOUND');
                    //     }

                    // }


                    //{ my: "Special", variable: 42 }
                    // ... do something ...
                }
            }
        });




        //                 db.cook_infos.find({    'food_details.cuisine_list':{"$elemMatch" :{'category_name':'Italian'
        //                 ,'status':'false'}}

        //                                         }, function (err, data, lastErrorObject) {


        //                                             if(err){
        //                                                     res.status(400);
        //                                                     res.send('error');
        //                                                      throw err;

        //                                                     }    
        //                                                     res.status(200).send(data);
        //                                                     console.log(data);
        //                                         });

    });


router
    .post('/fetch-food-by-id', function (req, res, next) {
        //       , {
        //    "food_details.$.": 1
        // }
        var u = {};
        var cat_list = [];
        var cat_list_data = [];
        console.log(req.body);

        db.cook_infos.findOne({

            'food_details._id': mongojs.ObjectId(req.body.food_id)
        }
            , function (err, food) {


                if (err) {
                    res.status(404);
                    res.send('No Food');
                } else {

                    u = food;
                    var check = 0;
                    // console.log(u.food_details[0].occassion_list[0].status);
                    for (var i = 0; i < u.food_details.length; i++) {

                        for (var j = 0; j < u.food_details[i].occassion_list.length; j++) {

                            if (u.food_details[i].occassion_list[j].status == "true") {


                                if (cat_list.length > 0) {
                                    check = 0;
                                    for (var k = 0; k < cat_list.length; k++) {



                                        if (cat_list[k] == u.food_details[i].occassion_list[j].group_attr) {

                                            check = 1;
                                            break;
                                        }


                                    }
                                    if (check == 0) {
                                        cat_list.push(u.food_details[i].occassion_list[j].group_attr);
                                    }

                                }
                                else {
                                    cat_list.push(u.food_details[i].occassion_list[j].group_attr);
                                }
                            }
                        }
                    }


                    var c_pos = 0;


                    var data_collection = [];

                    var main_obj = {};
                    //LOOP TILL CAT LIST 
                    //u is a collection of all foods of particular cook

                    for (var t = 0; t < cat_list.length; t++) {
                        var data_obj_arr = [];
                        for (var n = 0; n < u.food_details.length; n++) {


                            for (var s = 0; s < u.food_details[n].occassion_list.length; s++) {
                                var data_obj = {};

                                if (u.food_details[n].occassion_list[s].group_attr == cat_list[t] && u.food_details[n].occassion_list[s].status == "true") {

                                    data_obj.food_id = u.food_details[n]._id;
                                    data_obj.food_name = u.food_details[n].food_name;
                                    data_obj.food_cuisine = u.food_details[n].cuisine_list;
                                    data_obj.food_type = u.food_details[n].food_type;
                                    data_obj.food_price_per_plate = u.food_details[n].food_price_per_plate;
                                    data_obj.food_desc = u.food_details[n].food_desc;
                                    data_obj.cart_qty = u.food_details[n].cart_qty;
                                    data_obj.food_min_qty = u.food_details[n].food_min_qty;
                                    data_obj.food_max_qty = u.food_details[n].food_max_qty;
                                    data_obj.food_total_qty = u.food_details[n].food_total_qty;
                                    data_obj.selected_date_from = u.food_details[n].selected_date_from;
                                    data_obj.selected_date_to = u.food_details[n].selected_date_to;


                                    data_obj.food_price_per_plate = u.food_details[n].food_price_per_plate;

                                    data_obj_arr.push(data_obj);
                                    break;
                                }

                            }

                        }

                        var temp = cat_list[t];

                        main_obj[temp] = data_obj_arr;
                        data_collection.push(main_obj);
                    }
                    // for (var t = 0; t < u.food_details.length; t++) {

                    //     var c_pos = 0;
                    //     var main_obj = {};
                    //     var data_obj_arr = [];
                    //     for (var n = 0; n < u.food_details[t].occassion_list.length; n++) {
                    //         var data_obj = {};
                    //         if (u.food_details[t].occassion_list[n].group_attr == cat_list[c_pos] && u.food_details[t].occassion_list[n].status == "true") {

                    //             data_obj.food_id = u.food_details[t]._id;
                    //             data_obj.food_name = u.food_details[t].food_name;
                    //             data_obj.food_price_per_plate = u.food_details[t].food_price_per_plate;

                    //             data_obj_arr.push(data_obj);

                    //             console.log('we found your list');
                    //             c_pos++;
                    //         }

                    //     }

                    //     var temp = cat_list[t];

                    //     main_obj[temp] = data_obj_arr;


                    //     data_collection.push(main_obj);
                    //     //   console.log(main_obj);
                    // }

                    //THIS IS ALL I HAVE TO SEND FOR DETAIL FOOD VIEW
                    //   res.send(data_collection[0]);
                    var send_obj = {};

                    send_obj.food = food;
                    send_obj.menu_details = data_collection[0];
                    res.send(send_obj);

                    console.log(cat_list);
                    //    console.log(data_collection[0]);
                }
            });


    });

router
    .post('/fetch-food-by-id', function (req, res, next) {
        //       , {
        //    "food_details.$.": 1
        // }


        //     console.log(req.body);

        //         db.cook_infos.findOne({

        //         'food_details._id': mongojs.ObjectId(req.body.food_id)
        //     }
        // , function(err, food) {


        //         if (err) {
        //             res.status(404);
        //             res.send('No Food');
        //         } else {


        //             res.send(food);
        //            console.log(food);
        //         }
        //     });


    });

router
    .post('/check-promo-code', function (req, res, next) {

        console.log('PROMO CODE');


        db.admin_infos.find({



        },
            {
                'coupon_infos': 1
            },

            function (err, coupon) {


                if (err) {
                    res.status(404);
                    res.send(err);
                } else {

                    //res.send(coupon[0].coupon_infos);

                    var coupon_db_detail = coupon[0].coupon_infos;
                    var is_coupon_code_valid = false;

                    for (var i = 0; i < coupon_db_detail.length; i++) {

                        if (coupon_db_detail[i].coupon_code == req.body.promo_code) {

                            is_coupon_code_valid = true;

                        }

                    }

                    // CHECKING IF COUPON IS VALID OR Not

                    if (is_coupon_code_valid == true) {




                        var flag = 0;
                        var coupon_id;
                        var coupon_db_val;

                        var coupon_amount_detail = {};  // THIS IS USED TO SEND AS RESPONSE TO DEDUCT AMOUNT
                        var coupon_final_coll = [];
                        var current_coupon_count = 0;
                        var is_coupon_validate = false;
                        //calculating date range for coupon

                        var dates = [];
                        //var incoming_date = new Date(req.body[i].date);
                        function stringToDate(_date, _format, _delimiter) {
                            var formatLowerCase = _format.toLowerCase();
                            var formatItems = formatLowerCase.split(_delimiter);
                            var dateItems = _date.split(_delimiter);
                            var monthIndex = formatItems.indexOf("mm");
                            var dayIndex = formatItems.indexOf("dd");
                            var yearIndex = formatItems.indexOf("yyyy");
                            var month = parseInt(dateItems[monthIndex]);
                            month -= 1;
                            var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                            return formatedDate;
                        }

                        // var frm_date=stringToDate(coupon[0].coupon_infos[2].coupon_due_start,"dd/MM/yyyy","/");

                        // console.log('THIS IS FRM DATE');
                        // console.log(frm_date);
                        for (var i = 0; i < coupon[0].coupon_infos.length; i++) {

                            if (coupon[0].coupon_infos[i].coupon_code == req.body.promo_code) {
                                dates.push(new Date(stringToDate(coupon[0].coupon_infos[i].coupon_due_start, "dd/MM/yyyy", "/")));
                                dates.push(new Date(stringToDate(coupon[0].coupon_infos[i].coupon_due_end, "dd/MM/yyyy", "/")));
                            }
                        }

                        var maxDate = new Date(Math.max.apply(null, dates));
                        var minDate = new Date(Math.min.apply(null, dates));

                        const range = moment_r.range(minDate, maxDate);

                        var dd = moment();  // THIS IS CURRENT DATE
                        var isValidDate = dd.within(range);


                        if (isValidDate == true) {

                            console.log('DATE RANGE VALID');
                            // RETURN THE ERR RESPONSE

                            for (var m = 0; m < req.body.cuisine_list.length; m++) {

                                for (var i = 0; i < coupon[0].coupon_infos.length; i++) {

                                    if (coupon[0].coupon_infos[i].coupon_code == req.body.promo_code && coupon[0].coupon_infos[i].coupon_used_counter < parseInt(coupon[0].coupon_infos[i].coupon_voucher_limit)

                                        && coupon[0].coupon_infos[i].coupon_status == "Enable" && coupon[0].coupon_infos[i].cuisine_name == req.body.cuisine_list[m].cuisine_name
                                    ) {

                                        console.log('TESTING CCCC');
                                        coupon_amount_detail = {};
                                        coupon_amount_detail.coupon_id = coupon[0].coupon_infos[i]._id;
                                        // coupon_db_val = coupon[0].coupon_infos[i].coupon_used_counter + 1;
                                        coupon_amount_detail.coupon_discount_amount = coupon[0].coupon_infos[i].coupon_discount_amount;
                                        coupon_amount_detail.coupon_discount_operation = coupon[0].coupon_infos[i].coupon_discount_operation;
                                        coupon_amount_detail.coupon_cuisine_name = coupon[0].coupon_infos[i].cuisine_name;
                                        coupon_amount_detail.status = "coupon_valid";

                                        current_coupon_count = coupon[0].coupon_infos[i].coupon_used_counter;
                                        current_coupon_count = current_coupon_count + 1;

                                        is_coupon_validate = true;
                                        coupon_final_coll.push(coupon_amount_detail);
                                        break;

                                    }

                                }

                            }


                            console.log('THIS IS FINAL COUPON COLLECTION');
                            console.log(coupon_final_coll);

                            // UPDATING COUPON COUNTER +1
                            if (is_coupon_validate == true) {
                                db.admin_infos.update({
                                    "coupon_infos._id": mongojs.ObjectId(coupon_final_coll[0].coupon_id)
                                },

                                    {
                                        "$set": {
                                            "coupon_infos.$.coupon_used_counter": current_coupon_count,


                                        }


                                    }

                                    ,
                                    function (err, coupon) {
                                        if (err || !coupon) console.log("No  coupon found");
                                        else {
                                            console.log(coupon);
                                            res.json({ 'data': coupon_final_coll, 'status': 'coupon_valid' });
                                        }

                                    }



                                );      // UPDATING DB COUPON COUNTER

                            }
                            else {
                                res.json({ 'data': '', 'status': 'coupon_expired' });

                            }




                        } else if (isValidDate == false) {


                            res.json({ 'data': '', 'status': 'coupon_expired' });
                        }



                    }
                    else {

                        // RETURN THE ERR RESPONSE
                        res.json({ 'data': '', 'status': 'coupon_invalid' });
                    }


                }
            });
    });

router
    .post('/pay-now-for-foods', function (req, res, next) {


        //moment("2015-01-16T12:00:00").format("hh:mm:ss a")
        // console.log(req.body);
        // console.log(moment().toDate().getTime());
        var items = req.body;
        console.log('THIS IS ITEMS');
        //  console.log(items);
        var main_id = mongojs.ObjectId();

        var get_coupon_counter;
        var is_coupon_field = false;
        var is_already_have_coupon_id = false;
        var coupon_data_from_item = [];
        var coupon_data_obj = {};
        //CHECK IF INCOMING ITEMS HAS COUPON FIELD OR NOT;

        for (var m = 0; m < items.length; m++) {

            if (items[m].hasOwnProperty('coupon_info')) {

                coupon_data_obj = {};
                console.log('IT HAS COUPOIN FIELD');
                coupon_data_obj.coupon_id = items[m].coupon_info.coupon_id;
                coupon_data_obj.coupon_cuisine_name = items[m].coupon_info.coupon_cuisine_name;

                coupon_data_from_item.push(coupon_data_obj);

                //res.send('IT HAS COUPOIN FIELD');
                is_coupon_field = true;
                break;
            }
        }


        if (is_coupon_field == true) {
            console.log('THIS IS EXTRACTED COUPON FIELD');
            console.log(coupon_data_from_item);

            db.user_infos.find(

                {

                    _id: mongojs.ObjectId(items[0].user_id)
                }
                ,
                function (err, user, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {


                        // CHECK IF INCOMING DATA HAS COUPON FIELD ATTACHED OR Not
                        // IF ATTACHED THEN PERFORM FOLLOWING OPERATION

                        if (user[0].coupon_detail.length > 0) {

                            console.log('IT has COUPON');

                            //FETCH CURRENT  COUNTER VAL
                            for (var s = 0; s < user[0].coupon_detail.length; s++) {

                                if (user[0].coupon_detail[s].coupon_id == coupon_data_from_item[0].coupon_id) {
                                    get_coupon_counter = user[0].coupon_detail[s].coupon_counter;
                                    get_coupon_counter = get_coupon_counter + 1;
                                    is_already_have_coupon_id = true;
                                }
                            }

                            if (is_already_have_coupon_id == true) {

                                //UPDATE COUPON VAL WITH +1
                                db.user_infos.findAndModify(

                                    {
                                        query: {
                                            // _id: mongojs.ObjectId(items[0].user_id)
                                            'coupon_detail.coupon_id': coupon_data_from_item[0].coupon_id  // CHANGE THIS WITH INCOMING COUPON ID
                                            //   _id:mongojs.ObjectId(req.body.user_id)
                                        },
                                        update: {
                                            $set: {
                                                'coupon_detail.$.coupon_counter': get_coupon_counter
                                            }

                                        },
                                        new: true
                                    },
                                    function (err, data, lastErrorObject) {
                                        if (err) {
                                            res.status(400);
                                            res.send('error');
                                            throw err;

                                        } else {



                                            console.log('success');
                                            //   res.send('success');
                                        }

                                    });

                            }
                            if (is_already_have_coupon_id == false) {

                                db.user_infos.findAndModify(

                                    {
                                        query: {
                                            _id: mongojs.ObjectId(items[0].user_id)
                                            //  _id: mongojs.ObjectId(req.body.user_id)
                                        },
                                        update: {
                                            $push: {
                                                'coupon_detail': {

                                                    'coupon_id': coupon_data_from_item[0].coupon_id,
                                                    'coupon_counter': 1,

                                                }
                                            }

                                        },
                                        new: true
                                    },
                                    function (err, data, lastErrorObject) {
                                        if (err) {
                                            res.status(400);
                                            res.send('error');
                                            throw err;

                                        } else {

                                            console.log('success');


                                        }

                                    });

                            }

                        }
                        else {
                            console.log('IT has EMPTY COUPON');
                            db.user_infos.findAndModify(

                                {
                                    query: {
                                        _id: mongojs.ObjectId(items[0].user_id)
                                        //  _id: mongojs.ObjectId(req.body.user_id)
                                    },
                                    update: {
                                        $push: {
                                            'coupon_detail': {

                                                'coupon_id': coupon_data_from_item[0].coupon_id,
                                                'coupon_counter': 1,

                                            }
                                        }

                                    },
                                    new: true
                                },
                                function (err, data, lastErrorObject) {
                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    } else {

                                        console.log('success');
                                        //   res.send('success');
                                    }

                                });

                            // CHECK IF INCOMING DATA HAS COUPON FIELD ATTACHED OR Not
                            // IF ATTACHED THEN PERFORM FOLLOWING OPERATION


                        }

                        // PLACE BELOW ORDER SAVING CODE

                        db.user_infos.findAndModify(

                            {
                                query: {
                                    _id: mongojs.ObjectId(items[0].user_id)

                                },
                                update: {
                                    $push: {
                                        'orders': {

                                            'order_id': main_id,
                                            'date': moment(new Date()).format("DD/MM/YYYY"),
                                            'time': moment().toDate().getTime(),
                                            'order_status': 'pending',
                                            'items': items
                                        }
                                    }

                                },
                                new: true
                            },
                            function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                } else {

                                    // FOR INSERTING COUPON DETAIL

                                    // db.user_infos.find(

                                    //     {

                                    //         _id: mongojs.ObjectId(items[0].user_id)

                                    //     },
                                    //     ,
                                    //     function (err, user, lastErrorObject) {
                                    //         if (err) {
                                    //             res.status(400);
                                    //             res.send('error');
                                    //             throw err;

                                    //         } else {



                                    //             console.log('success');
                                    //             //   res.send('success');
                                    //         }

                                    //     });


                                    for (var i = 0; i < items.length; i++) {


                                        db.user_infos.findAndModify(

                                            {
                                                query: {
                                                    _id: mongojs.ObjectId(items[i].user_id)

                                                },
                                                update: {
                                                    $push: {
                                                        'sub_order_status': {

                                                            'main_order_id': main_id,
                                                            'sub_order_id': items[i].order_id,
                                                            'sub_order_status': 'pending',
                                                            'time': moment().toDate().getTime(),

                                                        }
                                                    }

                                                },
                                                new: true
                                            },
                                            function (err, data, lastErrorObject) {
                                                if (err) {
                                                    res.status(400);
                                                    res.send('error');
                                                    throw err;

                                                } else {

                                                    console.log('success');
                                                    //   res.send('success');
                                                }

                                            });

                                    }


                                    console.log('THIS IS MAIN ID');

                                    res.send('success');
                                }

                            });


                        // console.log(user);
                        // res.send(user);
                    }

                });



        }

        // NOT HAVE COUPON FIELD IN INCOMING ITEMS  ********

        else {


            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(items[0].user_id)

                    },
                    update: {
                        $push: {
                            'orders': {

                                'order_id': main_id,
                                'date': moment(new Date()).format("DD/MM/YYYY"),
                                'time': moment().toDate().getTime(),
                                'order_status': 'pending',
                                'items': items
                            }
                        }

                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {

                        // FOR INSERTING COUPON DETAIL

                        // db.user_infos.find(

                        //     {

                        //         _id: mongojs.ObjectId(items[0].user_id)

                        //     },
                        //     ,
                        //     function (err, user, lastErrorObject) {
                        //         if (err) {
                        //             res.status(400);
                        //             res.send('error');
                        //             throw err;

                        //         } else {



                        //             console.log('success');
                        //             //   res.send('success');
                        //         }

                        //     });


                        for (var i = 0; i < items.length; i++) {


                            db.user_infos.findAndModify(

                                {
                                    query: {
                                        _id: mongojs.ObjectId(items[i].user_id)

                                    },
                                    update: {
                                        $push: {
                                            'sub_order_status': {

                                                'main_order_id': main_id,
                                                'sub_order_id': items[i].order_id,
                                                'sub_order_status': 'pending',
                                                'time': moment().toDate().getTime(),

                                            }
                                        }

                                    },
                                    new: true
                                },
                                function (err, data, lastErrorObject) {
                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    } else {

                                        console.log('success');
                                        //   res.send('success');
                                    }

                                });

                        }


                        console.log('THIS IS MAIN ID');

                        res.send('success');
                    }

                });



        }



        //TESTING




    });

router
    .post('/get-user-open-order-by-id', function (req, res, next) {


        console.log(req.body);
        // res.send(req.body);
        db.user_infos.find(

            {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            {
                orders: 1, sub_order_status: 1
            },
            function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                } else {

                    var open_order_coll = []
                    var open_order_obj = {};

                    for (var i = 0; i < data[0].orders.length; i++) {

                        if (data[0].orders[i].order_status == "pending") {

                            open_order_coll.push(data[0].orders[i]);
                        }
                    }

                    for (var m = 0; m < data[0].sub_order_status.length; m++) {

                        for (var j = 0; j < open_order_coll.length; j++) {

                            for (var k = 0; k < open_order_coll[j].items.length; k++) {

                                if (open_order_coll[j].items[k].order_id == data[0].sub_order_status[m].sub_order_id) {

                                    open_order_coll[j].items[k].sub_order_status = data[0].sub_order_status[m].sub_order_status;
                                }
                            }
                        }


                    }

                    res.send(open_order_coll);
                    console.log(data);
                    console.log('success');

                }

            });

    });
module.exports = router;
