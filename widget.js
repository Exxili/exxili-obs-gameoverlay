
// const { useQuasar } = Quasar;
const { ref } = Vue;

// Data
let userOptions = {
  channelName: "",
};
// Commands

// Counter
const CounterIncrement = "!c+"
const CounterDecrement = "!c-"
const CounterClear = "!cc"

/**
 * Counter Store for Stream Death Counter
 */
 const useCounterStore = Pinia.defineStore('counter', {
  state() {
    return {
      isActive: false,
      value: 0,
    }
  },
  actions: {
    increment(state) {
      this.value++
      this.isActive = true;
    },
    decrement(state) {
      this.value--
      this.isActive = true;
    },
    clear(state) {
      this.value = 0;
      this.isActive = false;
    }
  }
})

/**
 * Sanitize any Text coming from HTML Events
 */
function html_encode(e) {
  return e.replace(/[\<\>\"\^]/g, function (e) {
      return "&#" + e.charCodeAt(0) + ";";
  });
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
 * EventsHandler
 * Triggers when Streamelements fires off 'onEventReceived'
 * @param {*} obj Stream Elements Object when events fire
 */
function EventsHandler(obj) {
    console.log("EventName", obj);

    // Handle Chat Messages
    if (obj.detail.listener === "message") {

      // Sanitize the Input
      const data = obj.detail.event.data;

      // Get Data Elements
      const message = html_encode(data.text);
      const user = data.nick;
      const userState = {
        mod: parseInt(data.tags.mod),
        badges: {
          broadcaster: (user === userOptions.channelName)
        }
      }

      ChatCommandHandler(user, userState, message)
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
    window.addEventListener('onWidgetLoad', function (obj) {
      userOptions.channelName = obj.detail.channel.username;
    });
      
    // Setup an event listener for Streamelements events
    window.addEventListener('onEventReceived', function (obj) {
      EventsHandler(obj);
    });

    function onFirstPageClick() {
      CounterStore.increment();
    }
  
    return {
      CounterStore,
      onFirstPageClick
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
    }
  },
  template: `
    <q-page class="column items-center justify-center">
      <bar/>
    </q-page>
  `
})

app.component('bar', {
  setup() {
    return {
      //
    }
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
      <q-icon class="notification" name="mdi-message-badge"/>
    </div>

  `
})

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

// Setup Pinia for use
const pinia = Pinia.createPinia();
app.use(pinia)

// Setup Quasar for use
app.use(Quasar, { config: {} });

// Finally Mount the Application
app.mount('#q-app');