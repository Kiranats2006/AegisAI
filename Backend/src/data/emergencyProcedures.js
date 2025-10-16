const emergencyProcedures = {
  medical: {
    heart_attack: [
      "Call emergency services immediately (911 or local emergency number)",
      "Help the person sit down and rest in a comfortable position",
      "Loosen any tight clothing",
      "If prescribed, help them take their medication (nitroglycerin)",
      "Monitor breathing and be prepared to perform CPR if trained",
      "Do not give them anything to eat or drink"
    ],
    choking: [
      "Ask 'Are you choking?' - if they can cough or speak, encourage coughing",
      "If unable to breathe, perform abdominal thrusts (Heimlich maneuver)",
      "Call emergency services if the object isn't dislodged quickly",
      "If person becomes unconscious, begin CPR",
      "Continue until help arrives or object is dislodged"
    ],
    bleeding: [
      "Wear gloves if available to protect from bloodborne pathogens",
      "Apply direct pressure to the wound with a clean cloth",
      "Elevate the injured area above heart level if possible",
      "Apply a bandage firmly but not too tight",
      "If bleeding soaks through, add more dressing but don't remove original",
      "Call emergency services for severe bleeding"
    ]
  },
  fire: {
    building_fire: [
      "Alert everyone in the building - shout 'Fire!'",
      "Feel doors with back of hand before opening - if hot, use another exit",
      "Stay low to avoid smoke inhalation",
      "Use stairs, never elevators",
      "Close doors behind you to contain fire",
      "Call emergency services once safe",
      "Go to designated meeting point"
    ],
    kitchen_fire: [
      "For grease fires: turn off heat source and cover with metal lid",
      "Never use water on grease fires",
      "Use baking soda or Class K fire extinguisher for kitchen fires",
      "For oven fires: turn off oven and keep door closed",
      "Evacuate if fire spreads beyond immediate area",
      "Call emergency services if not extinguished within 30 seconds"
    ]
  },
  police: {
    burglary: [
      "If inside, lock yourself in a room and stay quiet",
      "Call emergency services immediately",
      "Do not confront the intruder",
      "Provide your location and description of intruder if safe",
      "Stay on the line with dispatcher until help arrives"
    ],
    assault: [
      "Get to a safe location immediately",
      "Call emergency services",
      "Preserve any evidence if possible",
      "Seek medical attention even for minor injuries",
      "Do not wash or change clothes if evidence collection is needed"
    ]
  },
  natural_disaster: {
    earthquake: [
      "Drop, Cover, and Hold On",
      "Get under sturdy furniture or against interior wall",
      "Stay away from windows and exterior walls",
      "If outdoors, move to open area away from buildings and power lines",
      "If in vehicle, pull over and stay inside",
      "Be prepared for aftershocks"
    ],
    flood: [
      "Move to higher ground immediately",
      "Do not walk or drive through flood waters",
      "Avoid contact with flood water (may be contaminated)",
      "Turn off electricity at main breaker if safe to do so",
      "Follow evacuation orders from authorities"
    ]
  }
};

module.exports = emergencyProcedures;