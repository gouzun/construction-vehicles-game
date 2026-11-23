// Game state management and pub/sub listener bus

export const VIEWPORTS = {
  portrait: { id: 'portrait', name: 'Mobile Portrait', width: 390, height: 844, isDevice: true },
  landscape: { id: 'landscape', name: 'Mobile Landscape', width: 844, height: 390, isDevice: true },
  tablet: { id: 'tablet', name: 'Tablet (iPad)', width: 768, height: 1024, isDevice: true },
  fluid: { id: 'fluid', name: 'Responsive Fullscreen', width: null, height: null, isDevice: false }
};

export const VEHICLES = {
  excavator: {
    id: 'excavator',
    color: '#f59e0b', // construction amber yellow
    accentColor: '#d97706',
    secondaryColor: '#1f2937',
    parts: [
      { id: 'chassis', nameKey: 'partChassis', order: 1, target: { x: 50, y: 55, w: 220, h: 45 } },
      { id: 'wheels', nameKey: 'partWheels', order: 2, target: { x: 45, y: 92, w: 230, h: 48 } },
      { id: 'cabin', nameKey: 'partCabin', order: 3, target: { x: 60, y: 15, w: 105, h: 65 } },
      { id: 'arm', nameKey: 'partArm', order: 4, target: { x: 150, y: 10, w: 135, h: 80 } }
    ],
    taskCount: 3, // 3 scoops of dirt
    taskActionKey: 'digSoil'
  },
  dump_truck: {
    id: 'dump_truck',
    color: '#eab308', // bright construction yellow
    accentColor: '#ca8a04',
    secondaryColor: '#27272a',
    parts: [
      { id: 'chassis', nameKey: 'partChassis', order: 1, target: { x: 40, y: 65, w: 235, h: 35 } },
      { id: 'wheels', nameKey: 'partWheels', order: 2, target: { x: 45, y: 92, w: 225, h: 48 } },
      { id: 'cabin', nameKey: 'partCabin', order: 3, target: { x: 180, y: 25, w: 90, h: 65 } },
      { id: 'bed', nameKey: 'partBed', order: 4, target: { x: 45, y: 15, w: 130, h: 65 } }
    ],
    taskCount: 3, // 3 dumps of gravel
    taskActionKey: 'dumpLoad'
  }
};

class GameStateManager {
  constructor() {
    this.state = {
      viewport: 'portrait',
      vehicleId: 'excavator',
      stage: 'select', // 'select' | 'assembly' | 'fueling' | 'site' | 'wash' | 'completed'
      
      // Stage 1: Assembly
      assembledParts: [],
      
      // Stage 2: Fueling
      fuelLevel: 0,
      isPumping: false,
      
      // Stage 3: Site Construction
      siteActionCount: 0,
      buildingLevel: 0,
      
      // Stage 4: Wash
      activeTool: 'sponge', // 'sponge' | 'water' | 'dryer'
      washProgress: {
        sponge: 0,
        water: 0,
        dryer: 0
      },
      dirtSpots: [
        { id: 1, x: 25, y: 40, size: 28, cleaned: false },
        { id: 2, x: 45, y: 55, size: 34, cleaned: false },
        { id: 3, x: 70, y: 35, size: 30, cleaned: false },
        { id: 4, x: 35, y: 75, size: 36, cleaned: false },
        { id: 5, x: 65, y: 70, size: 32, cleaned: false }
      ]
    };
    
    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setViewport(mode) {
    if (VIEWPORTS[mode]) {
      this.state.viewport = mode;
      this.notify();
    }
  }

  selectVehicle(vehicleId) {
    if (VEHICLES[vehicleId]) {
      this.state.vehicleId = vehicleId;
      this.resetVehicleProgress();
      this.state.stage = 'assembly';
      this.notify();
    }
  }

  setStage(stage) {
    this.state.stage = stage;
    this.notify();
  }

  resetVehicleProgress() {
    this.state.assembledParts = [];
    this.state.fuelLevel = 0;
    this.state.isPumping = false;
    this.state.siteActionCount = 0;
    this.state.buildingLevel = 0;
    this.state.activeTool = 'sponge';
    this.state.washProgress = { sponge: 0, water: 0, dryer: 0 };
    this.state.dirtSpots = [
      { id: 1, x: 28, y: 38, size: 28, cleaned: false },
      { id: 2, x: 46, y: 52, size: 34, cleaned: false },
      { id: 3, x: 72, y: 36, size: 30, cleaned: false },
      { id: 4, x: 36, y: 72, size: 36, cleaned: false },
      { id: 5, x: 64, y: 68, size: 32, cleaned: false }
    ];
  }

  // Assembly actions
  assemblePart(partId) {
    if (!this.state.assembledParts.includes(partId)) {
      this.state.assembledParts = [...this.state.assembledParts, partId];
      this.notify();
      return true;
    }
    return false;
  }

  isAssemblyComplete() {
    const vehicle = VEHICLES[this.state.vehicleId];
    return vehicle.parts.every(p => this.state.assembledParts.includes(p.id));
  }

  // Fueling actions
  setFuelLevel(level) {
    this.state.fuelLevel = Math.min(100, Math.max(0, level));
    this.notify();
  }

  addFuel(amount) {
    this.setFuelLevel(this.state.fuelLevel + amount);
    return this.state.fuelLevel >= 100;
  }

  // Site actions
  performSiteAction() {
    const vehicle = VEHICLES[this.state.vehicleId];
    if (this.state.siteActionCount < vehicle.taskCount) {
      this.state.siteActionCount++;
      this.state.buildingLevel = Math.round((this.state.siteActionCount / vehicle.taskCount) * 100);
      this.notify();
      return this.state.siteActionCount >= vehicle.taskCount;
    }
    return true;
  }

  // Wash actions
  setActiveWashTool(tool) {
    this.state.activeTool = tool;
    this.notify();
  }

  addWashProgress(tool, amount) {
    if (this.state.washProgress[tool] !== undefined) {
      this.state.washProgress[tool] = Math.min(100, this.state.washProgress[tool] + amount);
      this.notify();
      return this.state.washProgress[tool] >= 100;
    }
    return false;
  }

  cleanDirtSpot(spotId) {
    const spot = this.state.dirtSpots.find(s => s.id === spotId);
    if (spot && !spot.cleaned) {
      spot.cleaned = true;
      this.notify();
    }
  }

  isWashFullyClean() {
    return (
      this.state.washProgress.sponge >= 100 &&
      this.state.washProgress.water >= 100 &&
      this.state.washProgress.dryer >= 100
    );
  }
}

export const gameState = new GameStateManager();
