webapp boilerplate with gulpjs
==

HTML5 boilerplate with gulpjs (with error handling)

Usage
==
To start, clone the repo and download dependencies.    
Prerequisites to be installed: [nodejs](www.nodejs.org), [gulpjs](www.gulpjs.com)

    $ git clone https://github.com/alyssaq/webapp-boilerplate
    $ npm install
    $ bower install

To build the project, which creates the `app` folder:
    
    $ gulp
    
To build and stay connected with live-reload for development (files served from `src`):
    
    $ gulp dev

Run
==
Start a simple HTTP server and view the site

#### Node (requires http-server module): 

    $ npm install http-server -g
    $ http-server app -p 9999

#### Python:

    $ cd app
    $ python -m SimpleHTTPServer 9999

Open and view the site at `localhost:9999`

Contribute
==
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
