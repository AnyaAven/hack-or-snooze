// So we don't have to keep re-finding things on page, find DOM elements once:

export const $storiesLoadingMsg = document.querySelector("#LoadingMsg");
export const $allStoriesList = document.querySelector("#AllStoriesList");
export const $favoriteStories = document.querySelector("#FavoriteStories");

// selector that finds all three story lists
export const $storiesLists = document.querySelector(".stories-list");

export const $loginForm = document.querySelector("#LoginForm");
export const $signupForm = document.querySelector("#SignupForm");
export const $newStoryForm = document.querySelector("#NewStoryForm");

export const $navLogin = document.querySelector("#Nav-login");
export const $navUserProfile = document.querySelector("#Nav-userProfile");
export const $navLogOut = document.querySelector("#Nav-logout");
export const $navSubmit = document.querySelector("#Nav-submit");
export const $navFavorites = document.querySelector("#Nav-favorites");
export const $navAllStories = document.querySelector("#Nav-all");

