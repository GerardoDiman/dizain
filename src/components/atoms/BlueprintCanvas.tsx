import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BlueprintCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Create a technical grid that reacts to light
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    const gridMaterial = new THREE.MeshStandardMaterial({
      color: 0x46583c,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      emissive: 0x46583c,
      emissiveIntensity: 0.1
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -2;
    scene.add(gridMesh);

    // Particles as small spheres to catch the light
    const particlesGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const particlesMaterial = new THREE.MeshStandardMaterial({
      color: 0x005a7b,
      emissive: 0x005a7b,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesGroup = new THREE.Group();
    for (let i = 0; i < 200; i++) {
      const mesh = new THREE.Mesh(particlesGeometry, particlesMaterial);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 40
      );
      particlesGroup.add(mesh);
    }
    scene.add(particlesGroup);

    // Interactive Light (The "Scanner")
    const light = new THREE.PointLight(0x87cff9, 100, 25); // Increased intensity
    light.position.set(0, 5, 0);
    scene.add(light);

    // Subtle Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    camera.position.z = 15;
    camera.position.y = 6;
    camera.rotation.x = -0.4;

    // Mouse movement interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetZ = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
      
      // Map mouse to 3D plane
      targetX = mouseX * 40;
      targetZ = mouseY * 40;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Reactive movement for light
      light.position.x += (targetX - light.position.x) * 0.1;
      light.position.z += (targetZ - light.position.z) * 0.1;
      
      // Floating particles
      particlesGroup.rotation.y += 0.001;
      
      // Camera movement
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-60" 
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

export default BlueprintCanvas;
