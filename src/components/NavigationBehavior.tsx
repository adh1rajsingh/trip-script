"use client"

import { useEffect, useState } from 'react'

export default function NavigationBehavior() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Add background blur after scrolling past hero
      setIsScrolled(currentScrollY > 100)
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const navbar = document.querySelector('.navbar')
    if (navbar) {
      navbar.classList.toggle('navbar-scrolled', isScrolled)
      navbar.classList.toggle('navbar-hidden', isHidden)
    }
  }, [isScrolled, isHidden])

  return null
}