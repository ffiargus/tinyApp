#tinyApp

Version 1.0.0

This is an application that contains a website that can shorten URLs into 6 character codes.

This website contains the basic features, such as creating new short URLs and updating your existing short URLs, registering and loging in as a user, creating new short URLs on your account and sharing them.

The account passwords are stored on the server after being hashed with bcrypt for user protection. The cookies are encrypted to hide user ids.

This app also implements a visit counter for each tiny URL, which will keep track of each visit and visit from a unique visitor. The visits are also timestamped and logged with a visit Id for tracking and analytics.

Additional features include a sidebar on every page displaying the top 5 most visited tiny URLs and message box on the home page to allow users to discuss and share URLs with each other.

