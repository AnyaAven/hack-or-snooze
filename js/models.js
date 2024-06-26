const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/** Model for a story
 * Properties:
 * - storyId: string
 * - title: string
 * - author: string
 * - url: string
 * - username: string
 * - createdAt: string
 */
class Story {
  /** Make instance of Story from data object about story:
   *   - {storyId, title, author, url, username, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.updatedAt = "";
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Static method to fetch a story from the API.
   *
   * Accepts:
   *  - storyId: string
   *
   * Returns: new Story instance of the fetched story.
   */
  static async getStory(storyId) {
    const response = await fetch(`${BASE_URL}/stories/${storyId}`);
    const data = await response.json();
    const storyData = data.story;
    return new Story(storyData);
  }

  /** Parses hostname out of URL and returns it.
   *
   * http://foo.com/bar => foo.com
   *
   */

  getHostName() {
    console.debug("getHostName");

    const storyUrl = new URL(this.url);

    return storyUrl.hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 *****************************************************************************/

/**
 * Storylist represents a collection of all current Story instances
 * Properties:
 * - stories: array of story instances
 */

class StoryList {

  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`);
    const data = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = data.stories.map((s) => new Story(s));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /**
   * Send story data to API, make a Story instance, update the current user's
   * stories, and add the story as the first item to this StoryList.
   *
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    console.debug("addStory", { user, newStory });

    const userAndNewStory =
      JSON.stringify({ token: user.loginToken, story: newStory });

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: userAndNewStory
    });

    const apiStoryData = await response.json();
    const storyDataDetails = apiStoryData.story;

    const newStoryInstance = new Story(storyDataDetails);

    //Add to the top of our list and remove the last item
    this.stories.unshift(newStoryInstance);
    user.ownStories.push(newStoryInstance);

    return newStoryInstance;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 *****************************************************************************/

/**
 * Model for a user
 * Properties:
 * - username: string
 * - name: string
 * - createdAt: string
 * - favorites: array of story instances
 * - ownStories: array of story instances
 */
class User {
  constructor(
    {
      username,
      name,
      createdAt,
      favorites = [],
      ownStories = [],
    },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store login token on the user so that it's easy to find for API calls.
    this.loginToken = token;
  }

  /**
   * Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const body = JSON.stringify({ user: { username, password, name } });
    const resp = await fetch(`${BASE_URL}/signup`, { method: "POST", body });
    if (!resp.ok) {
      throw new Error("Signup failed");
    }
    const data = await resp.json();
    const { user, token } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /**
   * Login in user with API, make User instance & return it.
   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const body = JSON.stringify({ user: { username, password } });
    const resp = await fetch(`${BASE_URL}/login`, { method: "POST", body });
    if (!resp.ok) throw new Error("Login failed");
    const data = await resp.json();
    const { user, token } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /**
   * When we already have credentials (token & username) for a user,
   * we can log them in automatically. This function does that.
   * Returns new user (or null if login failed).
   */

  static async loginViaStoredCredentials(token, username) {
    const qs = new URLSearchParams({ token });
    const response = await fetch(`${BASE_URL}/users/${username}?${qs}`);
    if (!response.ok) {
      console.error("loginViaStoredCredentials failed");
      return null;
    }
    const data = await response.json();
    const { user } = data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      token,
    );
  }

  /**
   * Pass a story instance to add to the current user's favorites.
   * Update API to reflect any new favorites added
   */

  async addFavorite(story) {
    console.debug("addFavorite", { story });

    const storyId = story.storyId;

    const tokenJSON = JSON.stringify({ token: this.loginToken });

    const response =
      await fetch(`${BASE_URL}/users/${this.username}/favorites/${storyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: tokenJSON
      });

    await response.json();
    //can you use to check if error from server ----> if(!response.ok)
    this.favorites.push(story);
  }

  /**
 * Pass a story instance to remove from the current user's favorites.
 * Update API to reflect that the story is removed from the
 * current user's favorites
 */

  async removeFavorite(story) {
    console.debug("removeFavorite", { story });

    const favoriteStoryId = story.storyId;

    const tokenJSON = JSON.stringify({ token: this.loginToken });

    const response =
      await fetch(`${BASE_URL}/users/${this.username}/favorites/${favoriteStoryId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: tokenJSON
      });

    const messageAndUserData = await response.json();

    //remove from user's favorites
    const favoriteStoryIndx =
      this.favorites.findIndex(story => story.storyId === favoriteStoryId);

    this.favorites.splice(favoriteStoryIndx, 1);
  }


}



export { Story, StoryList, User, BASE_URL };
