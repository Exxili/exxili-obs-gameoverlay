// const { useQuasar } = Quasar;
const { ref } = Vue;

// Data
const userOptions = {
  channelName: '',
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
    increment(state) {
      this.value++;
      this.isActive = true;
    },
    decrement(state) {
      this.value--;
      this.isActive = true;
    },
    clear(state) {
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
    const CounterStore = useCounterStore();

    // Setup an event listener for Streamelements widget onload
    window.addEventListener('onWidgetLoad', (obj) => {
      userOptions.channelName = obj.detail.channel.username;
    });

    // Setup an event listener for Streamelements events
    window.addEventListener('onEventReceived', (obj) => {
      EventsHandler(obj);
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
    return {
      //
    };
  },
  template: `
    <div class="bar">

      <!-- Logo -->
      <q-img 
        class="logo"
        src="https://cdn.streamelements.com/uploads/b8d62590-4dcc-423c-95a7-4a7c2dea5e7f.PNG"
        height="38px"
        width="38px"
      />

      <!-- Clock -->
      <clock />

      <!-- Noticication Icon -->
      <q-icon 
        class="notification" 
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
      // Follower Event
      if (obj.detail.listener === 'follower-latest') {
        const audio = new Audio('https://cdn.streamelements.com/uploads/0fbf6518-4cf1-4ab9-a15f-1c1ac8200d1e.mp3');
        audio.play();
        GenerateToastify(GenFollowText(obj.detail.event.name), 5000, { background: 'blue' });
      }

      // NewSubscriber Event - non gifted
      if (obj.detail.listener === 'subscriber-latest' && obj.detail.event.gifted === false) {
        const audio = new Audio('https://cdn.streamelements.com/uploads/36b7c307-d3e9-4b98-9988-861f501bfde4.mp3');
        audio.play();
        GenerateToastify(GenNewSubscriberText(obj.detail.event.name, obj.detail.event.amount, html_encode(obj.detail.event.message)), 5000, { color: 'black', background: 'orange' });
      }

      if (obj.detail.listener === 'host-latest') {
        GenerateToastify('Thanks for the host', 5000, { color: 'white', background: 'green' });
      }

      if (obj.detail.listener === 'tip-latest') {
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

// Setup Quasar for use
app.use(Quasar, { config: {} });

// Finally Mount the Application
app.mount('#q-app');
