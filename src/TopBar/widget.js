/* eslint-disable no-restricted-syntax */
// const { useQuasar } = Quasar;

const { ref, h } = Vue;
const socket = io('https://api.exxili.com', { transports: ['websocket'] });

socket.onAny((event, ...args) => {
  const sound = JSON.parse(args[0]);
  const audio = new Audio(sound.source);
  audio.play();
});

// Data
const userOptions = {
  channelName: '',
  apiToken: '',
  recentFollowers: [],
  recentSubscribers: [],
};
// Commands

// Counter
const CounterIncrement = '!c+';
const CounterDecrement = '!c-';
const CounterClear = '!cc';

/**
 * Counter Store for Stream Death Counter
 */
const useCounterStore = Pinia.defineStore('counter', {
  state() {
    return {
      isActive: false,
      value: 0,
    };
  },
  actions: {
    increment() {
      this.value += 1;
      this.isActive = true;
    },
    decrement() {
      this.value -= 1;
      this.isActive = true;
    },
    clear() {
      this.value = 0;
      this.isActive = false;
    },
  },
});

// Functions to generate Follower Text
function GenFollowText(name) {
  const followMessages = [
    `Thanks for following ${name}!`,
    `Appreciate the follow ${name}!`,
    `Hey, ${name} thanks for the follow!`,
    `A new follow, Thank you so much ${name}`,
  ];

  const randomIndex = Math.floor(Math.random() * followMessages.length);
  return followMessages[randomIndex];
}

function GenNewSubscriberText(name, amount, message) {
  const newSubMessages = [
    `Thanks for the ${amount} month sub ${name}`,
    `Appreciate the ${amount} month sub ${name}`,
    `Hey, ${name} thanks for the ${amount} month sub`,
    `A ${amount} month sub, Thank you so much ${name}`,
  ];

  const randomIndex = Math.floor(Math.random() * newSubMessages.length);
  let initialText = newSubMessages[randomIndex];

  if (message) {
    initialText += `\n\n ${message}`;
  }

  return initialText;
}

function GenTipText(name, amount, message) {
  const tipMessages = [
    `Thanks for the £${amount} tip ${name}!`,
    `Appreciate the £${amount} tip ${name}!`,
    `Hey, ${name}, thanks for the £${amount} tip!`,
    `A £${amount} tip!  Thank you so much ${name}!`,
  ];

  const randomIndex = Math.floor(Math.random() * tipMessages.length);
  let initialText = tipMessages[randomIndex];

  if (message) {
    initialText += `\n\n ${message}`;
  }

  return initialText;
}

function GenCheerText(name, amount, message) {
  const cheerMessages = [
    `Thanks for the ${amount} bittys ${name}!`,
    `Appreciate the ${amount} bittys ${name}!`,
    `Hey, ${name}, thanks for the ${amount} bittys`,
    `${amount} bittys!  Thank you so much ${name}!`,
  ];

  const randomIndex = Math.floor(Math.random() * cheerMessages.length);
  let initialText = cheerMessages[randomIndex];

  if (message) {
    initialText += `\n\n ${message}`;
  }

  return initialText;
}

/**
 * Sanitize any Text coming from HTML Events
 */
function html_encode(e) {
  return e.replace(/[\<\>\"\^]/g, (e) => `&#${e.charCodeAt(0)};`);
}

/**
 * ChatCommandHandler
 */
function ChatCommandHandler(user, userState, message) {
  const counterStore = useCounterStore();

  // Counter Commandss
  if (message === CounterIncrement && (userState.mod || userState.badges.broadcaster)) {
    counterStore.increment();
  }

  if (message === CounterDecrement && (userState.mod || userState.badges.broadcaster)) {
    counterStore.decrement();
  }

  if (message === CounterClear && (userState.mod || userState.badges.broadcaster)) {
    counterStore.clear();
  }
}

/**
 * Generate a Toastify.js Notification
 * @param {*} text The Text to be displayed in the toast
 * @param {*} duration the duration the toast will be displayed on screen
 * @param {*} style the css style for the toast notification
 */
function GenerateToastify(text, duration, style, avatar) {
  Toastify({
    text,
    duration,
    style,
    avatar,
    offset: {
      x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 35, // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
  }).showToast();
}

/**
 * EventsHandler
 * Triggers when Streamelements fires off 'onEventReceived'
 * @param {*} obj Stream Elements Object when events fire
 */
function EventsHandler(obj) {
  console.log('EventName', obj);

  // Handle Chat Messages
  if (obj.detail.listener === 'message') {
    // Sanitize the Input
    const { data } = obj.detail.event;

    // Get Data Elements
    const message = html_encode(data.text);
    const user = data.nick;
    const userState = {
      mod: parseInt(data.tags.mod),
      badges: {
        broadcaster: (user === userOptions.channelName),
      },
    };

    ChatCommandHandler(user, userState, message);
  }
}

/**
 * Construction of Vue 3 App
 * This is the apps main entry point which gets injected into
 * <div id="q-app">...</div> in HTML
 */
const app = Vue.createApp({
  setup() {
    // Identify Global Vars
    const CounterStore = useCounterStore();

    // Setup an event listener for Streamelements widget onload
    window.addEventListener('onWidgetLoad', (obj) => {
      console.log('obj', obj);
      userOptions.apiToken = obj.detail.channel.apiToken;
      userOptions.channelName = obj.detail.channel.username;
      userOptions.recentFollowers = obj.detail.session.data['follower-recent'];
    });

    // Setup an event listener for Streamelements events
    window.addEventListener('onEventReceived', (obj) => {
      EventsHandler(obj);
      userOptions.recentFollowers = obj.detail.session.data['follower-recent'];
    });

    function onFirstPageClick() {
      CounterStore.increment();
    }

    return {
      CounterStore,
      onFirstPageClick,
    };
  },
});

/**
 * Page Component
 * This is the main page of the overlay, containing all other components
 */
app.component('page', {
  setup() {
    return {
      //
    };
  },
  template: `
    <q-page class="column items-center justify-center">
      <bar/>
      <notifications />
    </q-page>
  `,
});

app.component('bar', {
  setup() {
    // Import the Death Counter Store
    const counterStore = useCounterStore();

    const game = ref('');

    const followers = ref('');
    const subscribers = ref('');

    window.addEventListener('onWidgetLoad', (obj) => {
      // Set Recent Followers
      userOptions.recentFollowers = obj.detail.session.data['follower-recent'];
      followers.value = userOptions.recentFollowers.map((follower) => `${follower.name}`).join(' ');

      // Set Recent Subscribers
      userOptions.recentSubscribers = obj.detail.session.data['subscriber-recent'];
      subscribers.value = userOptions.recentSubscribers.map((subscriber) => `${subscriber.name}`).join(' ');

      console.log('val', followers.value);
      console.log('subs', subscribers.value);
    });

    function GetCurrentGame() {
      console.log('getting current game');
      const url = 'https://decapi.me/twitch/game/exxili';
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open('GET', url, false);
      xmlHttp.send(null);
      return xmlHttp.responseText;
    }

    // Every minute check the current game to see if its been changed
    setInterval(() => {
      game.value = GetCurrentGame();
    }, 60000);

    // Perform first check for Current Game
    game.value = GetCurrentGame();

    console.log('followers', followers);
    console.log('useropts', userOptions);

    return {
      game,
      followers,
      subscribers,
      counterStore,
    };
  },
  template: `
    <div class="bar row justify-start">

      <!-- Logo -->
      <q-img 
        class="col logoRotateHorizontal"
        src="https://cdn.streamelements.com/uploads/b8d62590-4dcc-423c-95a7-4a7c2dea5e7f.PNG"
        style="height: 40px; max-width: 40px"
      />

      <!-- Game being Played -->
      <div
        class="col-auto"
        style="background: #666666; margin: 5px; border-radius: 10px;"
      >
        <div class="row justify-center items-center">
          <q-icon 
          class="col-1 currentGameIcon" 
          name="mdi-google-controller"
          size="25px"
          style="margin-top: 4px; margin-right: 15px; margin-left: 20px;"
          />
          <div class="col currentGameText"
          style="margin-top: 5px;"
          >
          {{game}}
          </div>
        </div>
      </div>

      <!-- Death Counter -->
      <div
        v-if="counterStore.isActive"
        class="col-auto"
        style="background: #666666; margin: 5px; border-radius: 10px;"
      >
        <div class="row justify-center items-center">
          <q-icon 
          class="col-1 currentGameIcon" 
          name="mdi-skull-crossbones"
          size="25px"
          style="margin-top: 4px; margin-right: 15px; margin-left: 20px;"
          />
          <div class="col currentGameText"
          style="margin-top: 5px;"
          >
            {{counterStore.value}}
          </div>
        </div>
      </div>

      <!-- Most Recent Followers -->
      <div
        class="col-auto"
        style="background: #666666; margin: 5px; border-radius: 10px; width: 300px;"
      >
        <div class="row justify-center items-center">
          <q-icon 
          class="col-1 currentGameIcon" 
          name="mdi-account"
          size="25px"
          style="margin-right: 15px; margin-left: 10px;"
          />
          <div class="col currentGameText"
          style="margin-top: 5px;"
          >
            <marquee scrollamount="3">{{followers}}</marquee>
          </div>
        </div>
      </div>

      <!-- Most Recent Subscribers -->
      <div
        class="col-auto"
        style="background: #666666; margin: 5px; border-radius: 10px; width: 300px;"
      >
        <div class="row justify-center items-center">
          <q-icon 
          class="col-1 currentGameIcon" 
          name="mdi-diamond-stone"
          size="25px"
          style="margin-right: 15px; margin-left: 10px;"
          />
          <div class="col currentGameText"
          style="margin-top: 5px;"
          >
            <marquee scrollamount="3">{{subscribers}}</marquee>
          </div>
        </div>
      </div>

      <q-space />

      <!-- Clock -->
      <clock 
      class="col"
      style="
      position: absolute;
      top: 10px;
      right: 55px;
      color: white;
      font-size: 14px;
      font-family: 'Exo', sans-serif;
      "
       />

      <!-- Notification Icon -->
      <q-icon 
        class="col" 
        style="
        position: absolute;
        top: 7px;
        right: 15px;
        color: white;
        "
        name="mdi-message-badge"
        size="25px"
      />
    </div>

  `,
});

/**
 * Overlay Bar's Clock Component
 * Displaying Local time to the User viewing the Overlay
 * Format: 00:00:00 - HH-MM-SS
 */
app.component('clock', {
  setup() {
    const osTime = ref('');

    setInterval(() => {
      const dateTime = new Date();
      osTime.value = dateTime.toLocaleTimeString();
    }, 1000);

    return {
      osTime,
    };
  },
  template: `
    <div class="time">
      {{osTime}}
    </div>
  `,
});

/**
 * Toast notifications for Events Listener
 * https://github.com/apvarun/toastify-js
 */
app.component('notifications', {
  setup() {
    window.addEventListener('onEventReceived', (obj) => {
      console.log('event', obj.detail.listener, obj.detail.event.gifted);

      // Follower Event
      if (obj.detail.listener === 'follower-latest') {
        const audio = new Audio('https://cdn.streamelements.com/uploads/0fbf6518-4cf1-4ab9-a15f-1c1ac8200d1e.mp3');
        audio.play();
        GenerateToastify(GenFollowText(obj.detail.event.name), 5000, { background: 'blue' });
      }

      // NewSubscriber Event - non gifted
      if (obj.detail.listener === 'subscriber-latest' && (obj.detail.event.gifted === false || obj.detail.event.gifted === undefined)) {
        const audio = new Audio('https://cdn.streamelements.com/uploads/36b7c307-d3e9-4b98-9988-861f501bfde4.mp3');
        audio.play();
        GenerateToastify(GenNewSubscriberText(obj.detail.event.name, obj.detail.event.amount, html_encode(obj.detail.event.message)), 5000, { color: 'black', background: 'orange' });
      }

      if (obj.detail.listener === 'host-latest') {
        GenerateToastify(`Thanks for the host ${obj.detail.event.name}`, 5000, { color: 'white', background: 'green' });
      }

      if (obj.detail.listener === 'tip-latest') {
        const audio = new Audio('https://cdn.streamelements.com/uploads/83513304-9a7f-4cdb-896b-1bf91578717f.mp3');
        audio.play();
        GenerateToastify(GenTipText(obj.detail.event.name, obj.detail.event.amount, html_encode(obj.detail.event.message)), 5000, { color: 'white', background: 'purple' });
      }

      if (obj.detail.listener === 'cheer-latest') {
        GenerateToastify(GenCheerText(obj.detail.event.name, obj.detail.event.amount, html_encode(obj.detail.event.message)), 5000, { color: 'white', background: 'teal' });
      }

      if (obj.detail.listener === 'raid-latest') {
        GenerateToastify(`Thank you for raiding ${obj.detail.event.name}`, 5000, { color: 'white', background: 'red' });
      }
    });

    return {
      //
    };
  },
});

// Setup Pinia for use
const pinia = Pinia.createPinia();
app.use(pinia);

// Add vue marquee text component

// Setup Quasar for use
app.use(Quasar, { config: {} });

// Finally Mount the Application
app.mount('#q-app');
