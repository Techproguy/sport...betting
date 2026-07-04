import type { SportKey, Team } from '../types';

export const SPORTS: { key: SportKey; label: string; icon: string; league: string }[] = [
  { key: 'NFL', label: 'NFL', icon: '🏈', league: 'National Football League' },
  { key: 'NBA', label: 'NBA', icon: '🏀', league: 'National Basketball Association' },
  { key: 'MLB', label: 'MLB', icon: '⚾', league: 'Major League Baseball' },
  { key: 'NHL', label: 'NHL', icon: '🏒', league: 'National Hockey League' },
  { key: 'Soccer', label: 'Soccer', icon: '⚽', league: 'Premier League' },
  { key: 'Tennis', label: 'Tennis', icon: '🎾', league: 'ATP Tour' },
  { key: 'MMA', label: 'MMA', icon: '🥋', league: 'UFC' },
  { key: 'Boxing', label: 'Boxing', icon: '🥊', league: 'WBC' },
  { key: 'Golf', label: 'Golf', icon: '⛳', league: 'PGA Tour' },
  { key: 'Cricket', label: 'Cricket', icon: '🏏', league: 'ICC' },
];

const C = {
  red: '#FF4D4F',
  blue: '#3B82F6',
  green: '#00D66F',
  orange: '#FB923C',
  purple: '#A855F7',
  yellow: '#FFC107',
  cyan: '#22D3EE',
  pink: '#EC4899',
  navy: '#1E3A8A',
  teal: '#14B8A6',
};

function t(name: string, short: string, color: string): Team {
  return { name, short, logo: short.slice(0, 3).toUpperCase(), color };
}

export const TEAMS: Record<SportKey, Team[]> = {
  NFL: [
    t('Kansas City Chiefs', 'KC', C.red),
    t('San Francisco 49ers', 'SF', C.red),
    t('Buffalo Bills', 'BUF', C.blue),
    t('Philadelphia Eagles', 'PHI', C.green),
    t('Dallas Cowboys', 'DAL', C.navy),
    t('Miami Dolphins', 'MIA', C.cyan),
    t('Baltimore Ravens', 'BAL', C.purple),
    t('Detroit Lions', 'DET', C.blue),
  ],
  NBA: [
    t('Boston Celtics', 'BOS', C.green),
    t('Denver Nuggets', 'DEN', C.navy),
    t('LA Lakers', 'LAL', C.purple),
    t('Milwaukee Bucks', 'MIL', C.green),
    t('Phoenix Suns', 'PHX', C.orange),
    t('Golden State Warriors', 'GSW', C.blue),
    t('Miami Heat', 'MIA', C.red),
    t('New York Knicks', 'NYK', C.orange),
  ],
  MLB: [
    t('LA Dodgers', 'LAD', C.blue),
    t('New York Yankees', 'NYY', C.navy),
    t('Atlanta Braves', 'ATL', C.red),
    t('Houston Astros', 'HOU', C.orange),
    t('Baltimore Orioles', 'BAL', C.orange),
    t('Philadelphia Phillies', 'PHI', C.red),
    t('Texas Rangers', 'TEX', C.blue),
    t('San Diego Padres', 'SD', C.yellow),
  ],
  NHL: [
    t('Florida Panthers', 'FLA', C.red),
    t('Edmonton Oilers', 'EDM', C.orange),
    t('Colorado Avalanche', 'COL', C.navy),
    t('Vegas Golden Knights', 'VGK', C.yellow),
    t('Boston Bruins', 'BOS', C.yellow),
    t('New York Rangers', 'NYR', C.blue),
    t('Dallas Stars', 'DAL', C.green),
    t('Toronto Maple Leafs', 'TOR', C.blue),
  ],
  Soccer: [
    t('Manchester City', 'MCI', C.cyan),
    t('Arsenal', 'ARS', C.red),
    t('Liverpool', 'LIV', C.red),
    t('Real Madrid', 'RMA', C.navy),
    t('Barcelona', 'BAR', C.blue),
    t('Bayern Munich', 'BAY', C.red),
    t('Manchester United', 'MUN', C.red),
    t('Paris Saint-Germain', 'PSG', C.navy),
  ],
  Tennis: [
    t('Carlos Alcaraz', 'ALC', C.green),
    t('Jannik Sinner', 'SIN', C.orange),
    t('Novak Djokovic', 'DJO', C.blue),
    t('Daniil Medvedev', 'MED', C.red),
    t('Alexander Zverev', 'ZVE', C.navy),
    t('Iga Swiatek', 'SWI', C.red),
    t('Aryna Sabalenka', 'SAB', C.yellow),
    t('Coco Gauff', 'GAU', C.cyan),
  ],
  MMA: [
    t('Islam Makhachev', 'MAK', C.red),
    t('Alex Pereira', 'PER', C.orange),
    t('Jon Jones', 'JON', C.blue),
    t('Ilia Topuria', 'TOP', C.red),
    t('Leon Edwards', 'EDW', C.green),
    t('Sean OMalley', 'OMA', C.purple),
    t('Dricus du Plessis', 'DDP', C.yellow),
    t('Charles Oliveira', 'OLI', C.navy),
  ],
  Boxing: [
    t('Canelo Alvarez', 'CAN', C.red),
    t('Tyson Fury', 'FUR', C.navy),
    t('Oleksandr Usyk', 'USY', C.blue),
    t('Terence Crawford', 'CRA', C.green),
    t('Naoya Inoue', 'INO', C.red),
    t('Gervonta Davis', 'DAV', C.yellow),
    t('Devin Haney', 'HAN', C.purple),
    t('Errol Spence', 'SPE', C.orange),
  ],
  Golf: [
    t('Scottie Scheffler', 'SCH', C.red),
    t('Rory McIlroy', 'MCI', C.green),
    t('Xander Schauffele', 'SCA', C.blue),
    t('Jon Rahm', 'RAH', C.navy),
    t('Ludvig Aberg', 'ABE', C.yellow),
    t('Collin Morikawa', 'MOR', C.orange),
    t('Viktor Hovland', 'HOV', C.cyan),
    t('Brooks Koepka', 'KOE', C.purple),
  ],
  Cricket: [
    t('India', 'IND', C.blue),
    t('Australia', 'AUS', C.yellow),
    t('England', 'ENG', C.red),
    t('South Africa', 'SA', C.green),
    t('Pakistan', 'PAK', C.green),
    t('New Zealand', 'NZ', C.navy),
    t('West Indies', 'WI', C.purple),
    t('Sri Lanka', 'SL', C.blue),
  ],
};

export const VENUES = [
  'Arrowhead Stadium',
  'TD Garden',
  'Yankee Stadium',
  'Madison Square Garden',
  'Wembley Stadium',
  'Etihad Stadium',
  'T-Mobile Arena',
  'Emirates Stadium',
  'Rogers Centre',
  'Camp Nou',
];

export const FIRST_NAMES = [
  'James', 'Maria', 'David', 'Sarah', 'Michael', 'Emily', 'Robert', 'Jessica', 'John', 'Ashley',
  'Daniel', 'Amanda', 'Chris', 'Nicole', 'Anthony', 'Elizabeth', 'Kevin', 'Megan', 'Brian', 'Lauren',
  'Marcus', 'Priya', 'Diego', 'Yuki', 'Omar', 'Sofia', 'Liam', 'Aisha', 'Noah', 'Chloe',
];
export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Patel', 'Nakamura', 'Okoye', 'Kim', 'Rossi', 'Chen', 'Novak', 'Silva', 'Ahmed', 'Murphy',
];

export const US_STATES = ['NJ', 'PA', 'NY', 'CO', 'MI', 'IL', 'AZ', 'VA', 'TN', 'OH', 'IN', 'IA'];

export const PROMOTIONS_SEED = [
  { title: 'Bet $5, Get $200 in Bonus Bets', subtitle: 'New players — instant on first bet', tag: 'WELCOME', color: '#00D66F', value: '$200', cta: 'Claim Offer' },
  { title: 'No Sweat First Bet up to $1,500', subtitle: 'Get a refund if your first bet loses', tag: 'RISK-FREE', color: '#3B82F6', value: '$1,500', cta: 'Opt In' },
  { title: 'Parlay Insurance', subtitle: 'One leg away? Get your stake back', tag: 'PARLAY', color: '#A855F7', value: 'Up to $25', cta: 'Learn More' },
  { title: 'NBA Finals Odds Boost', subtitle: 'Boosted lines on marquee matchups', tag: 'BOOST', color: '#FFC107', value: '+40%', cta: 'View Boosts' },
  { title: 'Refer a Friend', subtitle: 'You both get $50 in bonus bets', tag: 'REFERRAL', color: '#22D3EE', value: '$50', cta: 'Invite' },
  { title: 'Same Game Parlay Profit Boost', subtitle: 'Every SGP, every sport', tag: 'SGP', color: '#EC4899', value: '+50%', cta: 'Activate' },
];

export const TESTIMONIALS = [
  { name: 'Marcus T.', role: 'VIP Member · 2 years', quote: 'Fastest withdrawals I have used. Cashed out in under 10 minutes on ACH.', rating: 5 },
  { name: 'Priya S.', role: 'Casual Bettor', quote: 'The same-game parlay builder is unreal. Clean, fast, and the odds boosts are legit.', rating: 5 },
  { name: 'Diego R.', role: 'Sharp · High Roller', quote: 'Deep markets, live betting that actually keeps up. This is my primary book now.', rating: 5 },
  { name: 'Yuki N.', role: 'Weekend Player', quote: 'KYC took two minutes. Live streaming plus stats in one place is a game changer.', rating: 4 },
];
