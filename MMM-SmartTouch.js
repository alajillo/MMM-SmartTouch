/* Magic Mirror
 * MMM-SmartTouch.js
 *
 * By SmartBuilds.io - Pratik and Eben
 * https://smartbuilds.io
 * MIT Licensed.
 */

Module.register("MMM-SmartTouch", {
  defaults: {},

  start: function () {
    Log.info(this.name + " has started...");
    this.sendSocketNotification("CONFIG", this.config);
  },

  getStyles: function () {
    return [
      this.file("css/mmm-smarttouch.css"),
      "font-awesome.css",
      this.file("css/custom.css")
    ];
  },

  // Load translations files
  getTranslations: function () {
    return {
      en: "translations/en.json",
      nb: "translations/nb.json"
    };
  },

  createContainerDiv: function () {
    const containerDiv = document.createElement("div");
    containerDiv.className = "st-container";

    return containerDiv;
  },

  toggleStandby: function () {
    const existingBodyClass = document.body.className;
    if (existingBodyClass === "st-standby show") {
      document.body.className = "st-standby fade";
    } else {
      document.body.className = "st-standby show";
    }
  },

  createStandByButtonDiv: function () {
    const standByButtonDiv = document.createElement("div");
    standByButtonDiv.className = "st-container__standby-button";

    standByButtonDiv.appendChild(document.createElement("span"));
    standByButtonDiv.addEventListener("click", () => this.toggleStandby());

    return standByButtonDiv;
  },

  closeAllIframe() {
    const iframeList = document.querySelectorAll(`[data-iframe]`);
    iframeList.forEach((iframe) => {
      iframe.classList.add("hide");
    });
  },
  toggleSideMenu() {
    const menuToggleDiv = document.getElementById("st-menu-toggle");
    menuToggleDiv.classList.toggle("show");
    const menuContainer = document.querySelector(".custom-menu-container");
    menuContainer.classList.toggle("hide");
    this.closeAllIframe();
  },
  createIframeCloseButton() {
    const closeButton = document.createElement("i");
    closeButton.className =
      "custom-iframe-close-button fa-sharp fa-solid fa-xmark";
    const closeAllIframe = this.closeAllIframe;
    closeButton.addEventListener("click", closeAllIframe);
    return closeButton;
  },
  /**
   menuList : {
    icon : font-awesome class name,
    id : string,
    iframe : iframe 폴더 안에 있는 디렉토리 이름
   }[]
   *
   * @param menuList
   */
  createMenuContainer(menuList) {
    const menuContainer = document.createElement("div");
    menuContainer.classList.add("hide");
    menuContainer.classList.add("custom-menu-container");
    menuList.forEach((menu, index) => {
      const menuButton = this.createMenuButton({ ...menu, id: index });
      menuContainer.appendChild(menuButton);
      const iframe = this.createIframe({ ...menu, id: index });
      document.body.appendChild(iframe);
    });
    menuContainer.addEventListener("click", (e) => {
      this.addOpenIframe(e, this.toggleSideMenu.bind(this));
    });
    return menuContainer;
  },
  addOpenIframe(e, toggleSideMenu) {
    const dataMenuId = e.target.getAttribute("data-menu-id");
    if (dataMenuId === null) return;
    toggleSideMenu();
    const targetIframe = document.querySelector(
      `[data-iframe ="${dataMenuId}"]`
    );
    targetIframe.classList.remove("hide");
  },
  createIframe({ id, name }) {
    const iframeContainer = document.createElement("div");
    const iframeElement = document.createElement("iframe");
    iframeContainer.className = "custom-iframe hide";
    iframeElement.width = "100%";
    iframeElement.height = "100%";
    iframeElement.src = `iframe/${name}/index.html`;
    iframeContainer.setAttribute("data-iframe", id);
    const closeButton = this.createIframeCloseButton();
    iframeContainer.appendChild(closeButton);
    iframeContainer.append(iframeElement);
    return iframeContainer;
  },
  createMenuButton({ id, icon }) {
    const menuButton = document.createElement("i");
    menuButton.className = `custom-menu ${icon}`;
    menuButton.setAttribute("data-menu-id", id);
    return menuButton;
  },
  createMenuToggleButtonDiv: function () {
    const menuToggleButtonDiv = document.createElement("div");
    menuToggleButtonDiv.className = "st-container__menu-toggle";
    menuToggleButtonDiv.id = "st-menu-toggle";

    const hamburgerLineOne = document.createElement("div");
    hamburgerLineOne.className = "st-container__menu-toggle st-toggle__bar_one";

    const hamburgerLineTwo = document.createElement("div");
    hamburgerLineTwo.className = "st-toggle__bar_two";

    const hamburgerLineThree = document.createElement("div");
    hamburgerLineThree.className = "st-toggle__bar_three";

    menuToggleButtonDiv.appendChild(hamburgerLineOne);
    menuToggleButtonDiv.appendChild(hamburgerLineTwo);
    menuToggleButtonDiv.appendChild(hamburgerLineThree);

    menuToggleButtonDiv.addEventListener("click", () => this.toggleSideMenu());

    return menuToggleButtonDiv;
  },

  createShutdownButton: function () {
    const shutdownButtonItem = document.createElement("li");
    shutdownButtonItem.innerHTML =
      "<span class='fa fa-power-off fa-3x'></span>" +
      "<br>" +
      this.translate("SHUTDOWN");
    shutdownButtonItem.className = "li-t";

    // Send shutdown notification when clicked
    shutdownButtonItem.addEventListener("click", () =>
      this.sendSocketNotification("SHUTDOWN", {})
    );

    return shutdownButtonItem;
  },

  createRestartButton: function () {
    const restartButtonItem = document.createElement("li");
    restartButtonItem.innerHTML =
      "<span class='fa fa-repeat fa-3x'></span>" +
      "<br>" +
      this.translate("RESTART");
    restartButtonItem.className = "li-t";

    // Send restart notification when clicked
    restartButtonItem.addEventListener("click", () =>
      this.sendSocketNotification("RESTART", {})
    );

    return restartButtonItem;
  },

  createMainMenuDiv: function () {
    const mainMenuDiv = document.createElement("div");
    mainMenuDiv.className = "st-container__main-menu";
    mainMenuDiv.id = "st-main-menu";

    const shutdownButton = this.createShutdownButton();
    const restartButton = this.createRestartButton();

    const buttonList = document.createElement("ul");
    buttonList.appendChild(shutdownButton);
    buttonList.appendChild(restartButton);

    mainMenuDiv.appendChild(buttonList);

    return mainMenuDiv;
  },

  getDom: function () {
    // Initial standby state
    document.body.className = "st-standby show";
    const container = this.createContainerDiv();
    const menuList = this.config.menuList;
    const menuContainer = this.createMenuContainer(menuList);
    document.body.appendChild(menuContainer);
    const standByButton = this.createStandByButtonDiv();
    container.appendChild(standByButton);

    const menuToggleButton = this.createMenuToggleButtonDiv();
    container.appendChild(menuToggleButton);

    const mainMenu = this.createMainMenuDiv();
    document.body.appendChild(mainMenu);

    return container;
  },

  notificationReceived: function (notification, payload, sender) {},

  // Recieve notification from sockets via nodehelper.js
  socketNotificationReceived: function (notification, payload) {}
});
