/* Morphicons for the focused desktop hero UI.
   The project is framework-free, so this uses the official custom element
   binding and Lucide's icon-data package rather than React components. */

import { defineMorphIcon } from "../../node_modules/morphicons/dist/element.js";
import ShoppingCart from "../../node_modules/lucide/dist/esm/icons/shopping-cart.mjs";
import CircleCheck from "../../node_modules/lucide/dist/esm/icons/circle-check.mjs";
import ShoppingBag from "../../node_modules/lucide/dist/esm/icons/shopping-bag.mjs";
import PackageCheck from "../../node_modules/lucide/dist/esm/icons/package-check.mjs";
import Truck from "../../node_modules/lucide/dist/esm/icons/truck.mjs";
import MapPinCheck from "../../node_modules/lucide/dist/esm/icons/map-pin-check.mjs";
import BookOpen from "../../node_modules/lucide/dist/esm/icons/book-open.mjs";
import UtensilsCrossed from "../../node_modules/lucide/dist/esm/icons/utensils-crossed.mjs";
import ReceiptText from "../../node_modules/lucide/dist/esm/icons/receipt-text.mjs";
import ChefHat from "../../node_modules/lucide/dist/esm/icons/chef-hat.mjs";
import Workflow from "../../node_modules/lucide/dist/esm/icons/workflow.mjs";
import UserRound from "../../node_modules/lucide/dist/esm/icons/user-round.mjs";
import ChartNoAxesColumnIncreasing from "../../node_modules/lucide/dist/esm/icons/chart-no-axes-column-increasing.mjs";
import Zap from "../../node_modules/lucide/dist/esm/icons/zap.mjs";
import MousePointerClick from "../../node_modules/lucide/dist/esm/icons/mouse-pointer-click.mjs";
import Eye from "../../node_modules/lucide/dist/esm/icons/eye.mjs";
import Sparkles from "../../node_modules/lucide/dist/esm/icons/sparkles.mjs";

const FORMAT_PAIRS = {
  table: [ShoppingCart, CircleCheck],
  pickup: [ShoppingBag, PackageCheck],
  delivery: [Truck, MapPinCheck],
  menu: [BookOpen, UtensilsCrossed],
};

const STATUS_PAIRS = {
  accepted: [ShoppingCart, CircleCheck],
  cash: [ReceiptText, CircleCheck],
  kitchen: [ChefHat, CircleCheck],
};

const JOURNEY_ICONS = {
  speed: Zap,
  simple: MousePointerClick,
  clear: Eye,
  system: Workflow,
  guest: UserRound,
  cash: ReceiptText,
  kitchen: ChefHat,
  director: ChartNoAxesColumnIncreasing,
  result: Sparkles,
};

function initDesktopMorphicons() {
  const root = document.querySelector(".desktop-site");
  if (!root) return;

  defineMorphIcon();

  root.querySelectorAll("[data-dl-journey-icon]").forEach((icon) => {
    const iconData = JOURNEY_ICONS[icon.dataset.dlJourneyIcon];
    if (!iconData) return;
    icon.reducedMotion = "user";
    icon.set(iconData);
    if (icon.querySelector("svg")) icon.parentElement?.classList.add("is-morph-ready");
  });

  root.querySelectorAll("[data-dl-format-morph]").forEach((card) => {
    const pair = FORMAT_PAIRS[card.dataset.dlFormatMorph];
    const icon = card.querySelector("morph-icon");
    if (!pair || !icon) return;

    const [source, target] = pair;
    icon.reducedMotion = "user";
    icon.spring = "snappy";
    icon.set(source);
    if (icon.querySelector("svg")) icon.parentElement?.classList.add("is-morph-ready");

    const activate = () => {
      card.classList.add("is-morph-active");
      icon.morphTo(target, "snappy");
    };
    const reset = () => {
      card.classList.remove("is-morph-active");
      icon.morphTo(source, "snappy");
    };

    card.addEventListener("pointerenter", activate);
    card.addEventListener("pointerleave", reset);
    card.addEventListener("focusin", activate);
    card.addEventListener("focusout", reset);
  });

  const sync = root.querySelector(".dl-hero-sync");
  const steps = [...root.querySelectorAll("[data-dl-sync-morph]")];
  if (!sync || !steps.length) return;

  const preparedSteps = steps.map((step) => {
    const pair = STATUS_PAIRS[step.dataset.dlSyncMorph];
    const icon = step.querySelector("morph-icon");
    if (!pair || !icon) return null;

    const [source, target] = pair;
    icon.reducedMotion = "user";
    icon.spring = "smooth";
    icon.set(source);
    if (icon.querySelector("svg")) icon.parentElement?.classList.add("is-morph-ready");
    return { step, icon, target };
  }).filter(Boolean);

  let sequenceStarted = false;
  const runStatusSequence = () => {
    if (sequenceStarted) return;
    sequenceStarted = true;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    preparedSteps.forEach(({ step, icon, target }, index) => {
      const complete = () => {
        step.classList.add("is-complete");
        if (reduceMotion) icon.set(target);
        else icon.morphTo(target, "smooth");
      };

      if (reduceMotion) complete();
      else window.setTimeout(complete, 360 + index * 680);
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      runStatusSequence();
    }, { threshold: 0.7 });
    observer.observe(sync);
  } else {
    runStatusSequence();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDesktopMorphicons, { once: true });
} else {
  initDesktopMorphicons();
}
