# 🇹🇬 HermesTG — Boîte à Outils & Pass Réussite Togo

> **PWA (Progressive Web App) ultra-légère (< 2 Mo) et 100% Offline-First pour les élèves, étudiants et micro-entrepreneurs au Togo.**

---

## 🚀 Fonctionnalités Actives (MVP Semaine 1 & 2)

### 1. ⚡ Outils Anti-Frustration (100% Client-Side & 0 data)
* **Compresseur Garanti < 500 Ko :** 
  * Optimisé pour les bourses, concours administratifs et inscriptions universitaires au Togo.
  * Algorithme dichotomique local dans le navigateur via l'API Canvas : ne consomme aucun Mo de forfait Togocom/Moov.
  * Mode *"Scan Administratif"* : convertit en niveaux de gris et renforce le contraste pour effacer les ombres de photo de smartphone.
  * Export direct en PDF A4 prêt à téléverser.
* **Générateur Express de Reçu PDF WhatsApp :**
  * Conçu pour les vendeurs WhatsApp, freelances et commerçants de quartier.
  * Saisie rapide d'articles, calcul automatique en FCFA, et choix du moyen de paiement (T-Money, Flooz, Espèces).
  * Génération instantanée d'un reçu PDF au format mobile avec publicité virale intégrée (*"Généré sur HermesTG"*).

### 2. 🎓 Micro-Learning & Astuces Locales
* **5 Astuces Togo du Jour 1 :** Démarches concours < 500 Ko, économie de data Togocom/Moov x3, carte Visa prépayée UBA Africard sans compte bancaire, détection des arnaques en ligne en 30s, message WhatsApp de candidature spontanée.
* **3 Formations de 15 min :** Outils IA sur mobile pour devoirs et courriers, Vente WhatsApp Pro, Lancer un micro-service avec 0 FCFA.

### 3. 💼 Micro-Services Assistés par IA
* Commandes de rédaction de CV professionnel, audit de dossier et lettres de motivation avec réduction de 50% pour les abonnés du Pass.
* Redirection automatisée vers WhatsApp Business pour le traitement humain rapide.

### 4. 🤝 Programme Ambassadeur Campus (Affiliation)
* **500 FCFA nets** sur le premier Pass Mensuel (1 500 FCFA) parrainé.
* **250 FCFA récurrents** chaque mois tant que le filleul renouvelle.
* Jauge de retrait avec seuil minimal sécurisé fixé à 1 000 FCFA.

---

## 🛠️ Stack Technique 0 FCFA

* **Frontend :** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
* **PWA & Offline :** `vite-plugin-pwa` + Workbox Service Worker + Cache-First
* **Traitement PDF :** `jspdf` (génération vectorielle locale)
* **Backend & Auth (Prêt) :** Supabase (PostgreSQL + RLS + Storage)
* **Déploiement :** Vercel / Cloudflare Pages

---

## 💻 Commandes Utiles (Dans Termux)

```bash
# Lancer le serveur de développement local
npm run dev

# Tester la compilation de production
npm run build

# Déployer sur Vercel en 1 commande
vercel --prod
```
