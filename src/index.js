import './main.scss'


const btnFocus = document.getElementById('btnFocus')
window.onload = btnFocus.focus()
window.onload= localStorage.clear()

const searchBtn =  document.getElementById('btnSearch')
searchBtn.addEventListener('click', changePage)


function putAddressOntheNavbar(){
const addressBox = document.querySelector('.header__address')
const userAddress = document.getElementById('user-address')
const input = document.getElementById('inputSearch')
addressBox.style.display = 'flex'
userAddress.innerHTML = input.value
}

function changePage(){
  const home = document.getElementById('home')
  home.style.display = 'none'
  const footerHome = document.getElementById('footerHome')
  footerHome.style.display = 'none'
  const products = document.getElementById('products')
  products.style.display = 'block'
  const cart = document.getElementById('cart')
  cart.style.display ='flex'
  cart.style.position='fixed'
  putAddressOntheNavbar()
  getGeolocation()
}

function getGeolocation(){
  const input = document.getElementById('inputSearch')
  const appId = 'GmYWFK7v4aKRpXWuN8sL'
  const appCode = 'xUF__yTapkzCPf2gJ58a8Q'
  fetch(`https://geocoder.api.here.com/6.2/geocode.json?app_id=${appId}&app_code=${appCode}&searchtext=${input.value}`)
  .then(res => res.json())
  .then(function(data){
    const lat = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude
    const long =  data.Response.View[0].Result[0].Location.DisplayPosition.Longitude    
    getServicesNear(lat, long)
  })
}
 
function getServicesNear(lat, long){
const algorithm = 'NEAREST'
const now = new Date()
const query =  `query pocSearchMethod($now: DateTime!, $algorithm: String!, $lat: String!, $long: String!) {
  pocSearch(now: $now, algorithm: $algorithm, lat: $lat, long: $long) {
    __typename
    id
    status
    tradingName
    officialName
    deliveryTypes {
      __typename
      pocDeliveryTypeId
      deliveryTypeId
      price
      title
      subtitle
      active
    }
    paymentMethods {
      __typename
      pocPaymentMethodId
      paymentMethodId
      active
      title
      subtitle
    }
    pocWorkDay {
      __typename
      weekDay
      active
      workingInterval {
        __typename
        openingTime
        closingTime
      }
    }
    address {
      __typename
      address1
      address2
      number
      city
      province
      zip
      coordinates
    }
    phone {
      __typename
      phoneNumber
    }
  }
}`

fetch('https://803votn6w7.execute-api.us-west-2.amazonaws.com/dev/public/graphql',{
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json',
    "Accept": 'application/json',
  },
  body: JSON.stringify({
    query, 
    variables: {algorithm, lat, long, now}
  })
}).then(res => res.json())
  .then(function(data){
   const pocSearch = data.data.pocSearch
   const id = pocSearch[0].id
   console.log(data.data.pocSearch)

   const categoryId = ''
   const search = ''
   getAllProducts(id, categoryId, search)
 })
}


function getAllProducts(id, categoryId, search ){
const query = `query pocCategorySearch($id: ID!, $search: String!, $categoryId: Int!) {
  poc(id: $id) {
    products(categoryId: $categoryId, search: $search) {
      productVariants{
        title
        description
        imageUrl
        price
      }
    }
  }
 }`
 fetch('https://803votn6w7.execute-api.us-west-2.amazonaws.com/dev/public/graphql',{
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json',
    "Accept": 'application/json',
  },
  body: JSON.stringify({
    query, 
    variables: {
    id: id, 
    search: !search? '': search, 
    categoryId: !categoryId? 0 : categoryId
    }
  })
}).then(res => res.json())
.then(function(data){
  const listProducts = data.data.poc.products
  renderHTML(listProducts)
 })
}

const select = document.querySelector('select')
select.addEventListener('focus', getCategoryList)

function getCategoryList(identification){
  const query = `query allCategoriesSearch {
    allCategory {
      title
      id
    }
  }
  `
  const id = JSON.stringify(identification)
  fetch('https://803votn6w7.execute-api.us-west-2.amazonaws.com/dev/public/graphql',{
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      "Accept": 'application/json',
    },
    body: JSON.stringify({
      query, 
      variables: {id: id}
    })
  }).then(res => res.json())
    .then(function(data){
    console.log(data.data.allCategory)
    getAllProducts(id, id)
   })
  }

  function addOne(e){
    const gettingPrice = e.path[2]
    const price = gettingPrice.querySelector('p').innerHTML
    const path = e.path[1]
    const input = path.querySelector('input')
    input.value++
    handleCart(price)
  }

  function removeOne(e){
      const gettingPrice = e.path[2]
      const price = gettingPrice.querySelector('p').innerHTML
      const path = e.path[1]
      const input = path.querySelector('input')
      if(input.value == 0 || input.value === ''){return false}
      input.value--
      handleCart(price*-1)
  }


  let idStorage = 0
  function handleCart (item){
    const totalValue = document.getElementById('total')
    localStorage.setItem(`subtotal${idStorage}`, item );
    const storageTab = {...localStorage}
    let superTotal = [];
    for(const item in storageTab){
       superTotal.push(parseFloat(storageTab[item])) 
       let soma = superTotal.reduce((total, newValue)=> total + newValue,0)
        soma = Math.abs(soma)
       totalValue.innerHTML = soma.toFixed(2).replace('.', ',')
      }   
    idStorage++
  }


  function renderHTML (listProducts){
    for(const item of listProducts){
      console.log(item)
      const productsBox = document.getElementById('listOfProducts')
      const div = document.createElement('div')
      const prodTitle = document.createElement('h5')
      const prodImg = document.createElement('img')
      const prodPrice = document.createElement('p')
      const btnAdd = document.createElement('button')
      const btnRemove =  document.createElement('button')
      const btnBox = document.createElement('div')
      const numberOfItems = document.createElement('input')
      div.setAttribute('class', 'product__item')
      btnAdd.setAttribute('id', 'addItem')
      btnAdd.onclick = addOne
      numberOfItems.setAttribute('id', `numberOfItems`)
      btnRemove.onclick = removeOne
      btnRemove.setAttribute('id', 'removeItem')
      btnAdd.textContent = '+'
      btnRemove.textContent ='-'
      prodImg.src = item.productVariants[0].imageUrl
      prodTitle.textContent = item.productVariants[0].title
      prodPrice.textContent = item.productVariants[0].price.toFixed(2)
      div.appendChild(prodTitle)
      div.appendChild(prodImg)
      div.appendChild(prodPrice)
      btnBox.appendChild(btnRemove)
      btnBox.appendChild(numberOfItems)
      btnBox.appendChild(btnAdd)
      div.appendChild(btnBox)
      productsBox.appendChild(div)
    }
  }