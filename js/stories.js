// This is the global list of all stories (an instance of StoryList)
import {
  $allStoriesList,
  $newStoryForm,
  $storiesLoadingMsg,
} from "./dom";
import { Story, StoryList } from "./models";
import { currentUser } from "./user";

export let currStoryList;

/******************************************************************************
 * Generating HTML for a story
 *****************************************************************************/

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns DOM object for the story.
 */

export function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
  const $li = document.createElement("li");
  $li.id = story.storyId;
  $li.classList.add("Story", "mt-2");
  $li.innerHTML = `
      <a href="${story.url}" target="a_blank" class="Story-link">
        ${story.title}
      </a>
      <small class="Story-hostname text-muted">(${hostName})</small>
      <small class="Story-author">by ${story.author}</small>
      <small class="Story-user d-block">posted by ${story.username}</small>
    `;
  return $li;
}


/******************************************************************************
 * List all stories
 *****************************************************************************/

/** For in-memory list of stories, generates markup & put on page. */

export function putStoriesOnPage() {
  console.debug("putStoriesOnPage", {currentStories: currStoryList.stories});

  $allStoriesList.innerHTML = "";

  for (const story of currStoryList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.classList.remove("d-none");
}


/******************************************************************************
 * Start: show stories
 *****************************************************************************/

/** Get and show stories when site first loads. */

export async function fetchAndShowStoriesOnStart() {
  currStoryList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/******************************************************************************
 * New story
 *****************************************************************************/

/** Get new story from form and add to story list
 *
 * returns story instance
*/

export async function getNewStoryFromForm() {
  console.debug("getNewStoryFromForm")

  //can use new FormData
  const author = $newStoryForm.querySelector('#NewStoryForm-author').value;
  const title = $newStoryForm.querySelector('#NewStoryForm-title').value;
  const url = $newStoryForm.querySelector('#NewStoryForm-url').value;
  const newStory = { author, title, url };

  const newStoryInstance = await currStoryList.addStory(currentUser, newStory);

  console.log(currStoryList);
  return newStoryInstance;
}

/**
 * When a user submits a new story in the newStoryForm,
 * get and generate the new story and prepend to dom,
 * hide the newStoryForm,
 * and display the allStoriesList
 */
export async function updateUIOnSubmittingStory(evt) {
  evt.preventDefault();

  const storyInstance = await getNewStoryFromForm();

  $newStoryForm.classList.add("d-none");
  $newStoryForm.reset();

  const $story = generateStoryMarkup(storyInstance);
  $allStoriesList.prepend($story);
  $allStoriesList.removeChild($allStoriesList.lastElementChild);

  $allStoriesList.classList.remove("d-none")
}

$newStoryForm.addEventListener("submit", updateUIOnSubmittingStory);

