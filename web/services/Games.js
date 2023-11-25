import Scene0 from './scenes/scene-0.json'
import Scene1 from './scenes/scene-1.json'
import Scene2 from './scenes/scene-2.json'


 const scenes = [
    Scene0, Scene1, Scene2
].map( sceneJson =>{

    const players = {};
    sceneJson.assets.forEach( assetItem =>{
        players[ assetItem.name ] = {
            x: assetItem.loc.x,
            z: assetItem.loc.z,
        }
    })


    return {
        id : sceneJson.meta.name,
        players: players
    }
} )


export default scenes;

const mock =  [

    {
        id:'game-1',
        players: {
            'player-g-1': { x: 10, z: -10 },
            'player-g-2': { x: 20, z: 10 },
            'player-g-3': { x: 15, z: 0 },
            'player-g-4': { x: 0, z: 10 },
            'player-g-goalie': { x: 0, z: 0 },
            'player-h-goalie': { x: 0, z: 0 },
            'player-h-1': { x: 5, z: 0 },
            'player-h-2': { x: 5, z: 10 },
            'player-h-3': { x: 0, z: 5 },
            'player-h-0': { x: -18, z: 0 },
        }
    },
    {
        id:'game-2',
        players: {
            'player-g-1': { x: 0, z: -10 },
            'player-g-2': { x: 5, z: 10 },
            'player-g-3': { x: -15, z: 0 },
            'player-g-4': { x: 0, z: 10 },
            'player-g-goalie': { x: 7, z: 0 },
            'player-h-goalie': { x: 4, z: 0 },
            'player-h-1': { x: 15, z: 0 },
            'player-h-2': { x: -6, z: 0 },
            'player-h-3': { x: 10, z: -5 },
            'player-h-0': { x: -2, z: 2 },
        }
    }
]