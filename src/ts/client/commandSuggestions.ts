export interface CommandSuggestion { name: string; description: string; }
export const COMMANDS: CommandSuggestion[] = [
  {
    name: '/help',
    description: 'list all available commands'
  },
  {
    name: '/account',
    description: 'view account info in chat'
  },
  {
    name: '/roll',
    description: 'roll a random number between 1 and 100'
  },
  {
    name: '/say',
    description: 'say in public chat'
  },
  {
    name: '/party',
    description: 'say in party chat'
  },
  {
    name: '/think',
    description: 'say in thinking bubble'
  },
  {
    name: '/whisper',
    description: 'whisper to player'
  },
  {
    name: '/reply',
    description: 'reply to last incoming whisper'
  },
  {
    name: '/e',
    description: 'set a permanent expression'
  },
  {
    name: '/unstuck',
    description: 'resets position to spawn point'
  },
  {
    name: '/leave',
    description: 'leaves the game'
  },
  {
    name: '/turn',
    description: 'turn head around'
  },
  {
    name: '/magic',
    description: 'toggle magic light'
  },
  {
    name: '/drop',
    description: 'drop held item'
  },
  {
    name: '/droptoy',
    description: 'drop held toy'
  },
  {
    name: '/open',
    description: 'open gift'
  },
  {
    name: '/toys',
    description: 'show number of collected toys'
  },
  {
    name: '/boop',
    description: 'do a boop'
  },
  {
    name: '/lie',
    description: 'lie down or sit up'
  },
  {
    name: '/sit',
    description: 'sit down or stand up'
  },
  {
    name: '/stand',
    description: 'stand up or land'
  },
  {
    name: '/fly',
    description: 'fly up or land'
  },
  {
    name: '/sleep',
    description: 'fall asleep'
  },
  {
    name: '/love',
    description: 'show floating hearts'
  },
  {
    name: '/cry',
    description: 'start crying'
  },
  {
    name: '/blush',
    description: 'start blushing'
  },
  {
    name: '/smile',
    description: 'smile expression'
  },
  {
    name: '/happy',
    description: 'happy expression'
  },
  {
    name: '/frown',
    description: 'frown expression'
  },
  {
    name: '/angry',
    description: 'angry expression'
  },
  {
    name: '/sad',
    description: 'sad expression'
  },
  {
    name: '/thinking',
    description: 'thinking expression'
  },
  {
    name: '/yawn',
    description: 'yawn expression'
  },
  {
    name: '/laugh',
    description: 'laugh expression'
  },
  {
    name: '/sneeze',
    description: 'sneeze expression'
  },
  {
    name: '/excite',
    description: 'excite expression'
  },
  {
    name: '/savehouse',
    description: 'saves current house setup'
  },
  {
    name: '/loadhouse',
    description: 'loads saved house setup'
  },
  {
    name: '/resethouse',
    description: 'resets house setup to original state'
  },
  {
    name: '/lockhouse',
    description: 'prevents other people from changing the house'
  },
  {
    name: '/unlockhouse',
    description: 'enables editing by other people'
  },
  {
    name: '/removetoolbox',
    description: 'removes toolbox from the house'
  },
  {
    name: '/restoretoolbox',
    description: 'restores toolbox to the house'
  }
];
