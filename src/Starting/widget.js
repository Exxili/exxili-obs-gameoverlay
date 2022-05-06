/* eslint-disable no-restricted-syntax */
const { useQuasar, useDialogPluginComponent } = Quasar;
const { ref, defineEmits } = Vue;
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

// Clips
const clips = [
  {
    title: 'Accept the Fact!',
    user: 'Fraxxxi',
    src: 'https://cdn.streamelements.com/uploads/d034c4ed-7c5a-4851-aa30-b80c192bc6e6.mp4',
  },
  {
    title: 'AndyExe has broke',
    user: 'steamclockalice',
    src: 'https://cdn.streamelements.com/uploads/254b7c4f-5a09-451f-b323-8953f4debbec.mp4',
  },
  {
    title: 'Careful what you wish for',
    user: 'Fraxxxi',
    src: 'https://cdn.streamelements.com/uploads/9589d824-637d-4a91-a133-12aaefacfae3.mp4',
  },
  {
    title: 'Do the Andy Shake',
    user: 'Blanka_xx',
    src: 'https://cdn.streamelements.com/uploads/f873a17d-9bc6-4835-9dbd-e27ea2db2567.mp4',
  },
  {
    title: 'Double Jump!',
    user: 'Blanka_xx',
    src: 'https://cdn.streamelements.com/uploads/534cf5cc-1a3d-4ad7-a3ea-732c778b9fb7.mp4',
  },
  {
    title: 'Exxilis Song',
    user: 'steamclockalice',
    src: 'https://cdn.streamelements.com/uploads/dc4d6791-f253-4755-ae3d-947c0f0ef9ca.mp4',
  },
  {
    title: 'Glowing Broccoli Squad .... Assemble!',
    user: 'Fraxxxi',
    src: 'https://cdn.streamelements.com/uploads/cbe40056-8ead-42a4-a97c-ef180364bfa5.mp4',
  },
  {
    title: "Monkey see, monkey don't",
    user: 'Fraxxxi',
    src: 'https://cdn.streamelements.com/uploads/edadf9dc-95b4-4c81-b458-d7b0322a3802.mp4',
  },
  {
    title: 'OctoRage',
    user: 'm1ke51',
    src: 'https://cdn.streamelements.com/uploads/e752d30e-7777-4476-a566-a05bb60c8b21.mp4',
  },
  {
    title: 'This is how you should admire the cute things',
    user: 'blanka_xx',
    src: 'https://cdn.streamelements.com/uploads/88f40f3a-6857-409b-9ff2-c43929a80d94.mp4',
  },
];

// Sounds

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

const useVideoStore = Pinia.defineStore('video', {
  state() {
    return {
      finishedPlaying: true,
    };
  },
});

/**
 * Random Function to pick clips from array with no repeats
 * @param {*} array
 * @returns Random
 */
function randomNoRepeats(array) {
  let copy = array.slice(0);
  // eslint-disable-next-line func-names
  return function () {
    if (copy.length < 1) { copy = array.slice(0); }
    const index = Math.floor(Math.random() * copy.length);
    const item = copy[index];
    copy.splice(index, 1);
    return item;
  };
}

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

function PlayVideo($q, title, user, src) {
  console.log('PlayVideoProps', $q, title, user, src);

  $q.dialog({
    component: 'clips',

    // // props forwarded to your custom component
    componentProps: {
      title,
      user,
      src,
    },
    // ...more..props...
    // }
  }).onOk(() => {
    console.log('OK');
  }).onCancel(() => {
    console.log('Cancel');
  }).onDismiss(() => {
    console.log('Called on OK or Cancel');
  });
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
    const videoStore = useVideoStore();
    // eslint-disable-next-line guard-for-in
    // for (const field in window) {
    //   console.log(`${field} has been added`);
    // }
    const $q = useQuasar();

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

    const chooser = randomNoRepeats(clips);
    setInterval(() => {
      if (videoStore.finishedPlaying === true) {
        videoStore.finishedPlaying = false;

        const vidToPlay = chooser();
        PlayVideo($q, vidToPlay.title, vidToPlay.user, vidToPlay.src);
      }
    }, 30000);
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
    const loadingBarWidth = ref(0);

    const barHeight = ref('25px');
    const barWidth = ref(`${loadingBarWidth.value.toString()}px`);

    // TODO: Loading bar needs to be made a bit shorter - stopping at 2480 is too long
    const barInterval = setInterval(() => {
      console.log('BarIntervalTick Before');

      // Increment the width of the Loading bar by 3
      loadingBarWidth.value += 4.13333;

      // Set the Bars Width to the new Incremented Width
      barWidth.value = `${loadingBarWidth.value.toString()}px`;

      // Clear the interval if the loading bar has reached its max width based on 1920 x 1080
      if (loadingBarWidth.value >= 2480) {
        clearInterval(barInterval);
      }
    }, 1000);

    // const barInterval = setInterval(() => {
    //   console.log('Loading Bar Interval Tick before', loadingBarWidth.value, barWidth.value);
    //   // Increment the width of the Loading bar by 3
    //   loadingBarWidth.value += 3;
    //   // Set the Bars Width to the new Incremented Width
    //   barWidth.value = `${this.loadingBarWidth.value.toString()}px`;
    //   console.log('Loading Bar Interval Tick after', loadingBarWidth.value, barWidth.value);

    //   // Clear the interval if the loading bar has reached its max width based on 1920 x 1080
    //   if (loadingBarWidth.value >= 1840) {
    //     clearInterval(barInterval);
    //   }
    // }, 1000);
    return {
      barHeight,
      barWidth,
      //
    };
  },
  template: `
    <q-page class="column items-center justify-center">
      <bar/>

      <!-- Exxili Title -->
      <div
        style="
        position: absolute;
        transform: translate(-50%, -50%);
        top: 50%;
        left: 50%;
        color: white;
        font-size: 148px;
        font-family: 'Zilap Orion Personal Use', sans-serif;
        "
      >
        Exxili
      </div>

      <notifications />

      <!-- Loading Bar -->
      <div class="loadingBar" :style="{ height: barHeight, width: barWidth}"></div>
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

      // Sounds Events
      // socket.onAny((event, ...args) => {
      //   const sound = JSON.parse(args[0]);
      //   const audio = new Audio(sound.source);
      //   audio.play();

      //   GenerateToastify(`${obj.detail.event.name} played a sound -
      // ${sound.name}`, 5000, { background: 'pink' });
      // });

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

app.component('clips', {
  props: {
    title: String,
    user: String,
    src: String,
  },
  setup(props) {
    const videoStore = useVideoStore();

    console.log('props', props);

    defineEmits([
      // REQUIRED; need to specify some events that your
      // component will emit through useDialogPluginComponent()
      ...useDialogPluginComponent.emits,
    ]);

    const {
      dialogRef, onDialogHide, onDialogOK, onDialogCancel,
    } = useDialogPluginComponent();
    // dialogRef      - Vue ref to be applied to QDialog
    // onDialogHide   - Function to be used as handler for @hide on QDialog
    // onDialogOK     - Function to call to settle dialog with "ok" outcome
    //                    example: onDialogOK() - no payload
    //                    example: onDialogOK({ /*.../* }) - with payload
    // onDialogCancel - Function to call to settle dialog with "cancel" outcome

    // this is part of our example (so not required)
    function onOKClick() {
      // on OK, it is REQUIRED to
      // call onDialogOK (with optional payload)
      onDialogOK();
      // or with payload: onDialogOK({ ... })
      // ...and it will also hide the dialog automatically
    }

    function onVideoEnded() {
      console.log('VideoEnded');
      videoStore.finishedPlaying = true;
      onOKClick();
    }

    return {
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      props,
      onVideoEnded,
    };
  },
  template: `
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <div class="column justify-center items-center" style="background: #444444; min-width: 1330px; min-height: 760px;">

        <!-- Video -->
        <div class="col">
          <video width="1280" height="720" @ended="onVideoEnded" autoplay style="margin: 20px;">
            <source :src="props.src" type="video/mp4">
          </video>
        </div>

        <!-- title -->
        <div class="col"
        style="
        color: white;
        font-size: 22px;
        font-family: 'Exo', sans-serif;
        ">
        {{props.title}} - 
        {{props.user}}
        </div>

      </div>

      <!--<q-card class="q-dialog-plugin justify-center items-center" style="background: #444444; min-width: 1920px; min-height: 1080px;">
        <q-card-section>
          <video width="1280" height="720" @ended="onVideoEnded" autoplay style="margin: 20px;">
            <source :src="props.src" type="video/mp4">
          </video>
        </q-card-section>

        <q-card-section>
        {{props.title}} - 
        {{props.user}}
        
        </q-card-section>
 
      </q-card>-->
    </q-dialog>
  `,
});

// Setup Pinia for use
const pinia = Pinia.createPinia();
app.use(pinia);

// Setup Quasar for use
app.use(Quasar, { config: {} });

// Finally Mount the Application
app.mount('#q-app');
