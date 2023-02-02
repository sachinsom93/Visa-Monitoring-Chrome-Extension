# Visa Wait Times Monitoring Chrome Extension

## Features
- Set filter for all the available `non-immigrant visa type wait times`.
- Set and cancel for specific filter type.
- Push Notification on mentioned `repeat period`.

## Installing And Running
- Install Node version >= 16.0.0
  
- Clone this repository.
    ```
    git clone https://github.com/sachinsom93/Visa-Monitoring-Chrome-Extension
    ```

- Change current working directory to `/extension`.
    ```
    cd extension
    ```

- Install project specific dependencies and build the project.
    ```
    npm install
    npm run build:production
    ```
  Above command will generate a `dist` directory inside the project's extension directory.

- Open chrome browser and type `chrome://extension` to the url search box.

- Click on `Load Unpacked` as depicted in the following image and make sure you have checked the `developer mode`.

  ![image](https://user-images.githubusercontent.com/64790109/216249185-7f6aced8-9c9a-4a65-955c-e18b37de3469.png)

- Now, select the previously created (step- 4 build step) `dist` directory.

- Visit https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wait-times.html and access the extension.

## Join The Development
- Before you start contributing, run the app on your local machine, get familiar with it and then check for bugs or more features.
- If you find any bug or want to add a new feature you have to open a new bug/feature issue.
- If you would like to work on an existing issue, drop in a comment on the issue.
