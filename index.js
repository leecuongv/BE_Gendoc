const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const {
  UserRoute,
  AuthRoute,
  SocialRoutes,
  UploadRoutes,
  AdminRoutes,
  DocumentRoutes,
  TemplateRoutes
} = require('./routers');

const { notFound, errorHandler } = require("./routers/errorMiddleware");
const helmet = require("helmet");
//const passport = require('passport');
const rateLimit = require('express-rate-limit');
//const session = require('express-session');
const morgan = require('morgan');
const fileupload = require("express-fileupload");


dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))
app.use(fileupload());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50
});

//app.use(limiter)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3
});

// app.use(session({
//   secret: 'somethingsecretgoeshere',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true },
// }));

//app.use("/auth/login", loginLimiter);


//app.use(cors({ credentials: true, origin:"https://be-oes.vercel.app"}));//fix lỗi cross-domain
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.disable('x-powered-by');//fix lỗi leak info from x-powered-by

app.use(helmet.frameguard())//fix lỗi clickjacking
app.use(helmet.noSniff());//fix lỗi X-Content-Type-Options Header Missing
app.use(helmet.xssFilter());
app.use(
  helmet.hsts({
    maxAge: 31000000,
    preload: true,
  })
);

app.use(helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self' https://maxcdn.bootstrapcdn.com"],
    frameAncestors: ["'self'"],
    styleSrc: ["'self' https://maxcdn.bootstrapcdn.com"],
    fontSrc: ["'self' https://maxcdn.bootstrapcdn.com"],
    formAction: ["'self' https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"],
    objectSrc: ["'none'"],
    blockAllMixedContent: []
  }

}))

app.use(
  helmet.referrerPolicy({
    policy: ["no-referrer"],
  })
);

app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next()
});

mongoose.connect(URI)
  .then(async () => {
    console.log('Connected to Database')
  }).catch(err => {
    console.log('err', err)
  })


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `)
})
app.get('/', (req, res) => {
  res.send('SUCCESS');
});


// app.use(passport.initialize());
// app.use(passport.session());
app.use(morgan('combined'))
app.use('/api/auth', AuthRoute)
app.use('/api/user', UserRoute)
app.use('/api/social', SocialRoutes)
app.use("/api/upload", UploadRoutes)
app.use("/api/admin", AdminRoutes)
app.use("/api/document", DocumentRoutes)
app.use("/api/template", TemplateRoutes)

app.use(notFound);
app.use(errorHandler);