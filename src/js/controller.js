import * as modal from './modal.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// comes from parcel
// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search resukt
    resultsView.update(modal.getSearchResultsPage());

    // 1) Update bookmarks view
    bookmarksView.update(modal.state.bookmarks);

    // 2) Loading recipe
    await modal.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(modal.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search
    await modal.loadSearchResults(query);

    // 3) Render data
    resultsView.render(modal.getSearchResultsPage());

    // 4) Render initinal pagination buttons
    paginationView.render(modal.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(modal.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(modal.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  modal.updateServings(newServings);

  // Update the recipe view
  recipeView.update(modal.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!modal.state.recipe.bookmarked) modal.addBookmark(modal.state.recipe);
  else modal.deleteBookmark(modal.state.recipe.id);

  // 2) Render recipe view
  recipeView.update(modal.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(modal.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(modal.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the NEW recipe data
    await modal.uploadRecipe(newRecipe);
    console.log(modal.state.recipe);

    // Render recipe
    recipeView.render(modal.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(modal.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${modal.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC);
  } catch (err) {
    console.error('✨✨✨', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
