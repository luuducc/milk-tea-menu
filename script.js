import productData from './data/products.json' with { type: 'json' };
import storeData from './data/stores.json' with { type: 'json' };
import storeProductData from './data/storeProducts.json' with { type: 'json' };
const { products } = productData
const { stores } = storeData
const { storeProducts } = storeProductData

let myStoreProducts = {} // { storeId: {storeHTML, storeProducts}}
let currentStore = 1 // global variable to track the current store
let sortingOption = ['name', false] // default sorting option
let filterOptions = []

const header = document.getElementById("header")
const filterButton = document.getElementById("button-filter")
const filterPanel = document.getElementById("filter-panel")
const sortingOptionElement= document.getElementById("sorting-option")

renderSideBarHTML(stores)
// map store's productId to product detail
const storeProductIdList = storeProducts.reduce((acc, curr) => 
  (acc[curr.store] = acc[curr.store] ? [...acc[curr.store], curr.product] : [curr.product], acc), 
{}
);
for(let storeId in storeProductIdList) {
  myStoreProducts[storeId] = { storeHTML: {}, storeProducts: []}
  for(let value of storeProductIdList[storeId]) {
    myStoreProducts[storeId].storeProducts.push(products.find(product => product.id === value))
  }
  myStoreProducts[storeId].filterProducts = myStoreProducts[storeId].storeProducts
}
renderMenuHTML(myStoreProducts[currentStore].storeProducts)
header.innerText =  `Store ${currentStore} Menu`

sortingOptionElement.addEventListener('change', () => {
  const { selectedIndex } =  sortingOptionElement
  const { value: seletedValue } = sortingOptionElement.options[selectedIndex]
  console.log('hehe', selectedIndex, seletedValue)
  switch (seletedValue) {
    case '0': sortingOption = ['name', false]; break;
    case '1': sortingOption = ['name', true]; break;
    case '2': sortingOption = ['price', false]; break;
    case '3': sortingOption = ['price', true]; break;
  }
  renderMenuHTML(myStoreProducts[currentStore].filterProducts)
})

document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
  checkbox.addEventListener('click', () => {
    const { value: filterValue } = checkbox 
    const { filterProducts } = myStoreProducts[currentStore]
    const { storeProducts } = myStoreProducts[currentStore]
    if (checkbox.checked ) {
      filterOptions.push(filterValue)
      myStoreProducts[currentStore].filterProducts = filterProducts.filter(el => el.toppings.includes(filterValue))
    } else {
      filterOptions = filterOptions.filter(el => el !== filterValue)
      myStoreProducts[currentStore].filterProducts = filterOptions.reduce((acc, curr) => filterProduct(acc, curr), storeProducts)
    }
    renderMenuHTML(myStoreProducts[currentStore].filterProducts)
  })
})

// toggle filter panel
filterPanel.style.display = "none"
filterButton.addEventListener('click', () => {
  if (filterPanel.style.display === "none") {
    filterPanel.style.display = "block"
  } else {
    filterPanel.style.display = "none"
  }
})

document.querySelectorAll(".store").forEach(listItem => {
  listItem.addEventListener('click', () => {
    const { storeId } = listItem.dataset
    header.innerText = `Store ${storeId} Menu`
    renderMenuHTML(myStoreProducts[storeId].storeProducts)
    currentStore = storeId
  })
})


// ----------- UTIL FUNCTIONS -----------------
function renderMenuHTML (products) {
  products = sortProducts(products, sortingOption[0], sortingOption[1])
  document.getElementById("menu").innerHTML = products.reduce((acc, curr) => acc + `
  <div class="menu-item">
    <div class="menu-item-head">
      <p class="item-id">MT-${curr.id < 10 ? '0'+curr.id : curr.id}</p>
      <p class="item-name bold">${curr.name}</p>
    </div>
    <hr>
    <div class="menu-item-body">
      <p class="topping-title bold">Toppings:</p>
      <p class="topping-details">
        ${
          curr.toppings[0] + ', ' + 
          curr.toppings.slice(1).map(el => el[0].toLowerCase() + el.slice(1)).join(', ')
        }
      </p>
    </div>
    <div class="menu-item-foot">
      <span class="trending-tag" ${curr.isTrending ? '' : 'style="visibility: hidden"'}>Trending</span>
      <span class="price bold">${curr.price}</span>
    </div>
  </div>  
`, '')
}
function renderSideBarHTML (stores) {
  document.getElementById("side-bar-items").innerHTML = stores.reduce((acc, curr) => acc + `
  <li class="store" data-store-id="${curr.id}">Store ${curr.id}</li>
`, '')
}
function filterProduct(products, filterString) {
  return products.filter(product => product.toppings.includes(filterString)) 
}
function sortProducts(products, option, isDsc) {
  return products.sort((a, b) => {
    switch (option) {
      case "name": {
        return a.name.localeCompare(b.name) * (isDsc ? -1 : 1)
      }
      case "price": {
        return isDsc ? (b.price - a.price) : (a.price - b.price)
      }
    }
  })
}