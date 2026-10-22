export interface BoardNode {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  serverColor: string;
  bountyMultiplier: number;
  description: string;
  connectedNodeIds: string[]; // Conexões de rota para movimento do peão
}

export interface ServerRegion {
  id: string;
  name: string;
  icon: string;
  color: string;
  alertLevel: number; // 0 a 6
  maxAlert: number; // 6
  nodes: BoardNode[];
}

export const SERVERS_DATA: ServerRegion[] = [
  {
    id: 'server-bank',
    name: 'Banco Digital BankSafe',
    icon: '🏦',
    color: '#39d353',
    alertLevel: 1,
    maxAlert: 6,
    nodes: [
      {
        id: 'node-bank-login',
        name: 'Portaria de Autenticação',
        serverId: 'server-bank',
        serverName: 'Banco BankSafe',
        serverColor: '#39d353',
        bountyMultiplier: 1.5,
        description: 'Ponto de entrada do sistema bancário. vulnerabilidades de login e formulários.',
        connectedNodeIds: ['node-bank-db', 'node-ecom-cart']
      },
      {
        id: 'node-bank-db',
        name: 'Cofre de Dados Financeiros',
        serverId: 'server-bank',
        serverName: 'Banco BankSafe',
        serverColor: '#39d353',
        bountyMultiplier: 2.5,
        description: 'Servidor central contendo extratos e contas bancárias.',
        connectedNodeIds: ['node-bank-login', 'node-cloud-api']
      }
    ]
  },
  {
    id: 'server-ecom',
    name: 'Shopping Global ShopAll',
    icon: '🛒',
    color: '#f0883e',
    alertLevel: 0,
    maxAlert: 6,
    nodes: [
      {
        id: 'node-ecom-cart',
        name: 'Carrinho de Compras',
        serverId: 'server-ecom',
        serverName: 'Shopping ShopAll',
        serverColor: '#f0883e',
        bountyMultiplier: 1.0,
        description: 'Fluxo de pagamento e cupom de desconto.',
        connectedNodeIds: ['node-bank-login', 'node-ecom-catalog']
      },
      {
        id: 'node-ecom-catalog',
        name: 'Catálogo de Produtos',
        serverId: 'server-ecom',
        serverName: 'Shopping ShopAll',
        serverColor: '#f0883e',
        bountyMultiplier: 1.2,
        description: 'Busca de produtos e comentários de clientes.',
        connectedNodeIds: ['node-ecom-cart', 'node-social-feed']
      }
    ]
  },
  {
    id: 'server-social',
    name: 'Rede Social SocialHive',
    icon: '🐝',
    color: '#c084fc',
    alertLevel: 0,
    maxAlert: 6,
    nodes: [
      {
        id: 'node-social-feed',
        name: 'Feed de Notícias',
        serverId: 'server-social',
        serverName: 'Rede SocialHive',
        serverColor: '#c084fc',
        bountyMultiplier: 1.1,
        description: 'Publicações de usuários e envio de mensagens privadas.',
        connectedNodeIds: ['node-ecom-catalog', 'node-social-profile']
      },
      {
        id: 'node-social-profile',
        name: 'Gerenciador de Perfis',
        serverId: 'server-social',
        serverName: 'Rede SocialHive',
        serverColor: '#c084fc',
        bountyMultiplier: 1.3,
        description: 'Configurações de conta e fotos de usuários.',
        connectedNodeIds: ['node-social-feed', 'node-cloud-api']
      }
    ]
  },
  {
    id: 'server-cloud',
    name: 'Mega Nuvem CloudNine',
    icon: '☁️',
    color: '#58a6ff',
    alertLevel: 2,
    maxAlert: 6,
    nodes: [
      {
        id: 'node-cloud-api',
        name: 'Gateway de APIs Principais',
        serverId: 'server-cloud',
        serverName: 'Nuvem CloudNine',
        serverColor: '#58a6ff',
        bountyMultiplier: 3.0,
        description: 'Servidores de infraestrutura central. Recompensas gigantescas!',
        connectedNodeIds: ['node-bank-db', 'node-social-profile']
      }
    ]
  }
];

export const ALL_BOARD_NODES: BoardNode[] = SERVERS_DATA.flatMap(s => s.nodes);
