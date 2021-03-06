import * as THREE from 'three'
import { Speaker } from './speaker';
import webAudioTouchUnlock from 'web-audio-touch-unlock';


export class PositionalAudio { 
    private analyser: THREE.AudioAnalyser;
    private audioLeft: THREE.PositionalAudio;
    private audioRight: THREE.PositionalAudio;
    private loaded: boolean = false;
    private audioUnlocked: boolean = false;
    constructor(scene, camera, audioName, distance) {        

        // create an AudioListener and add it to the camera
        var listener = new THREE.AudioListener();
        camera.add( listener );

        // create the PositionalAudio object (passing in the listener)
        this.audioLeft = new THREE.PositionalAudio( listener );
        this.audioRight = new THREE.PositionalAudio( listener );

        // Create analyser to analyse song frequencies
        // We only need to analyse one audio since they play the same song
        this.analyser = new THREE.AudioAnalyser(this.audioLeft, 512*2);

        // load a sound and set it as the PositionalAudio object's buffer
        var audioLoader = new THREE.AudioLoader();

        var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (iOS) {
            // @ts-ignore: Unreachable code error
            var context = new (window.AudioContext || window.webkitAudioContext)();
            webAudioTouchUnlock(context)
            .then((unlocked) => {
                if(unlocked) {
                    console.log("need");
                    // AudioContext was unlocked from an explicit user action, sound should start playing now
                } else {
                    console.log("no need");
                    // There was no need for unlocking, devices other than iOS
                }
                this.audioUnlocked = true;
                if(this.loaded) {
                    console.log("PLAY: IS LOADED")
                    this.audioLeft.play();
                    this.audioRight.play();
                    // this.ambientAudio.startAudio();
                }
            }, function(reason) {
                console.error(reason);
            });
        }

        

        // load a resource
        audioLoader.load(
            'assets/audio/' + audioName,
            (( audioBuffer ) => {
                this.audioLeft.setBuffer( audioBuffer );
                this.audioLeft.setRefDistance( 15 );
                this.audioLeft.setLoop(true);
                this.audioRight.setBuffer( audioBuffer );
                this.audioRight.setRefDistance( 15 );
                this.audioRight.setLoop(true);  
                // set the audio object buffer to the loaded object
                this.loaded = true;
                if(!iOS || this.audioUnlocked) {
                    console.log("PLAY: IS UNLOCKED")
                    this.audioLeft.play();
                    this.audioRight.play();
                }
            }),
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },
            function ( err ) {
                console.log( 'Error: Could not load audio:' + audioName );
            }
        );

        let leftSpeaker = new Speaker();
        let rightSpeaker = new Speaker();

        //leftSpeaker.rotateY(Math.PI/2);
        //rightSpeaker.rotateY(Math.PI/2);

        leftSpeaker.position.set(-27, 3, distance/2 );
        rightSpeaker.position.set(-27, 3, -distance/2 );

        // leftSpeaker.rotation.set(0,180,0);
        // rightSpeaker.rotation.set(0,0,0);

        scene.add( leftSpeaker );
        scene.add( rightSpeaker );

        // Add the sound to the meshes
        leftSpeaker.add( this.audioLeft );
        rightSpeaker.add( this.audioRight );

    }

    getIntensity() {
        // Get frequency data 
        let frequencyData = this.analyser.getFrequencyData();
        let lowFrequenciesEnd = frequencyData.length/4;
        let sum = 0;
        // Iterate part of frequencies and sum
        for (let i = 0; i < lowFrequenciesEnd; i++) {
            sum += frequencyData[i];
        }

        // Return frequency average
        return (sum/lowFrequenciesEnd) * 0.007;
    }
}