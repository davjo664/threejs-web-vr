// three.js
import * as THREE from 'three'
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader'
import { API_KEY } from './apikey'

export class Booth extends THREE.Group{
    constructor() {
        super();

        if(!API_KEY) {
            console.warn("No Poly API KEY found. Add it to src/apikey.ts.");
            return;
        }

        fetch(`https://poly.googleapis.com/v1/assets/082e6B-a6or/?key=${API_KEY}`)
        .then(response => response.json())
        .then(asset =>  {
            var format = asset.formats.find( format => { return format.formatType === 'OBJ'; } );

            if ( format !== undefined ) {

                var obj = format.root;
                var mtl = format.resources.find( resource => { return resource.url.endsWith( 'mtl' ) } );

                var path = obj.url.slice( 0, obj.url.indexOf( obj.relativePath ) );

                var loader = new MTLLoader();
                loader.setCrossOrigin( true );
                loader.setMaterialOptions( { ignoreZeroRGBs: true } );
                loader.setTexturePath( path );
                loader.load( mtl.url,  ( materials ) => {

                    var loader = new OBJLoader();
                    
                    loader.setMaterials( materials );
                    loader.load( obj.url, ( object ) => {
                        var box = new THREE.Box3();
                        box.setFromObject( object );
                        // re-center

                        var center = box.getCenter(new THREE.Vector3());
                        center.y = box.min.y;
                        object.position.sub( center );

                        // scale
                        this.add( object );
                        this.scale.setScalar( 25 / box.getSize(new THREE.Vector3()).length() );

                        object.children.forEach(obj => {
                            // console.log(obj);
                            let a:THREE.Mesh = obj;
                            a.rotation.set(0,-90*0.0174532925,0);
                        });
                        

                    } );

                } );

            }

        } );
    }
}