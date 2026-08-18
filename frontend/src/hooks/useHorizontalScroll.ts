import { useEffect, useRef, useState } from "react";

export const useHorizontalScroll = () => {
  const elRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isTouchDevice = useRef(false); // Флаг для определения типа устройства

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const startDrag = (clientX: number) => {
      setIsDragging(true);
      setStartX(clientX - el.offsetLeft);
      setScrollLeft(el.scrollLeft);
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const endDrag = () => {
      setIsDragging(false);
      el.style.cursor = "grab";
      el.style.userSelect = "";
      isTouchDevice.current = false; // Сбрасываем флаг
    };

    const moveDrag = (clientX: number) => {
      if (!isDragging) return;
      const x = clientX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isTouchDevice.current = false;
      startDrag(e.pageX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      moveDrag(e.pageX);
    };

    const handleTouchStart = (e: TouchEvent) => {
      isTouchDevice.current = true;
      
      if (el.scrollWidth > el.clientWidth) {
        startDrag(e.touches[0].clientX);
      }
    };
    
    const handleTouchMove = () => {
      if (!isDragging || !isTouchDevice.current) return;
    };

    const handleScroll = () => {
      if (!el) return;
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      el.classList.toggle("scroll-start", scrollLeft <= 0);
      el.classList.toggle("scroll-end", scrollLeft >= maxScroll);
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseup", endDrag);
    el.addEventListener("mouseleave", endDrag);

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", endDrag, { passive: true });
    el.addEventListener("touchcancel", endDrag, { passive: true });

    el.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", endDrag);
      el.removeEventListener("mouseleave", endDrag);

      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", endDrag);
      el.removeEventListener("touchcancel", endDrag);

      el.removeEventListener("scroll", handleScroll);
    };
  }, [isDragging, startX, scrollLeft]);

  return elRef;
};