(function() {
    /**
     * PlaneGeometry data
     * @class
     */
    var PlaneGeometry = function(width, height, widthSegments, heightSegments) {
        PlaneGeometry.superClass.constructor.call(this);

        this.buildGeometry(width, height, widthSegments, heightSegments);
    }

    zen3d.inherit(PlaneGeometry, zen3d.Geometry);

    PlaneGeometry.prototype.buildGeometry = function(width, height, widthSegments, heightSegments) {
        width = width || 1;
    	height = height || 1;

    	var width_half = width / 2;
    	var height_half = height / 2;

    	var gridX = Math.floor( widthSegments ) || 1;
    	var gridY = Math.floor( heightSegments ) || 1;

    	var gridX1 = gridX + 1;
    	var gridY1 = gridY + 1;

    	var segment_width = width / gridX;
    	var segment_height = height / gridY;

    	var ix, iy;

    	// buffers

    	var indices = [];
    	var vertices = [];
    	var normals = [];
    	var uvs = [];

    	// generate vertices, normals and uvs

    	for ( iy = 0; iy < gridY1; iy ++ ) {

    		var y = iy * segment_height - height_half;

    		for ( ix = 0; ix < gridX1; ix ++ ) {

    			var x = ix * segment_width - width_half;

    			vertices.push( x, 0, y );

    			normals.push( 0, 1, 0 );

    			uvs.push( ix / gridX );
    			uvs.push( 1 - ( iy / gridY ) );

    		}

    	}

    	// indices

    	for ( iy = 0; iy < gridY; iy ++ ) {

    		for ( ix = 0; ix < gridX; ix ++ ) {

    			var a = ix + gridX1 * iy;
    			var b = ix + gridX1 * ( iy + 1 );
    			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
    			var d = ( ix + 1 ) + gridX1 * iy;

    			// faces

    			indices.push( a, b, d );
    			indices.push( b, c, d );

    		}

    	}

    	// build geometry

        this.setIndex(indices);
        this.addAttribute('a_Position', new zen3d.BufferAttribute(new Float32Array(vertices), 3));
        this.addAttribute('a_Normal', new zen3d.BufferAttribute(new Float32Array(normals), 3));
        this.addAttribute('a_Uv', new zen3d.BufferAttribute(new Float32Array(uvs), 2));

        this.computeBoundingBox();
        this.computeBoundingSphere();
    }

    zen3d.PlaneGeometry = PlaneGeometry;
})();
