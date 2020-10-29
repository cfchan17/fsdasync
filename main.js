//imports
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

//create an instance of Express app
const app = express()

//configure ports
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000
const API_KEY = process.env.API_KEY || ""

//configure view engine to handlebars
app.engine('hbs',
    handlebars({ defaultLayout: 'default.hbs'})//specify the default layout
)
app.set('view engine', 'hbs')

//query GIPHY API
const ENDPOINT = 'https://api.giphy.com/v1/gifs/search'

const createFullQuery = (searchString) => {
    return withQuery(ENDPOINT,
        {
            q: searchString,
            api_key: API_KEY
        }    
    )
}

const searchGiphy = (url, res, searchString) => {
    const p = fetch(url)
    p.then(result => {
        const p = result.json()
        p.then(data => {
            renderResults(data, res, searchString)
        }).catch(e => {
            console.info('error')
            console.info('error: ', e)
        })
    })
    .catch(err => {
        console.info('Promise rejected')
        console.error('error: ', err)
    })
}

const renderResults = (data, res, searchString) => {
    let imagesArray = data["data"]
    let imagesURLArray = []
    for(i = 0; i < imagesArray.length; i++) {
        imagesURLArray.push(imagesArray[i]['images']['fixed_height']['url'])
    }
    res.status(200)
    res.type('text/html')
    res.render('searchResult',
        {
            searchGifsArray: imagesURLArray,
            searchTerm: searchString
        }
    )
}

//********* Middlewares *********/
app.get(['/', 'index.html'], (req, res) => {
    res.status(200)
    res.type('text/html')
    res.render('index')
})

app.get('/search', (req, res) => {
    const searchString = req.query.searchstring
    let url = createFullQuery(searchString)
    searchGiphy(url, res, searchString)
})

//alternative using async await to currently used method
/*
app.get('/search', async (req,res) => {
    const result = await fetch(url)
    const giphys = await result.json()
    const imgs = []
    for(let d of giphys.data) {
        const title = d.title
        const url = d.images.fixed_height.url
        imgs.push({title, url})
    }
    res.status(200)
    res.type('text/html')
    res.render(searchResult,{
        searchGifsArray: imgs
    })
})
*/

//start the app
if(API_KEY) {
    app.listen(
        PORT,
        () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        }
    )
}

