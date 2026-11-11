# 🇹🇬 Djanta Hub — La Force d'Avancer au Togo

> **PWA (Progressive Web App) ultra-légère (< 2 Mo) et 100% Offline-First pour les élèves, étudiants et micro-entrepreneurs au Togo.**
> *Djanta (Le Lion en Éwé) : force, résilience et ambition.*

---

## 🦁 Fonctionnalités Actives

### 1. ⚡ Outils Anti-Frustration (100% Client-Side & 0 data)
* **Compresseur Garanti < 500 Ko :** 
  * Calibré spécifiquement pour les bourses (DBA Lomé), concours administratifs (Fonction Publique, ENA) et Campus France.
  * Algorithme dichotomique local dans le navigateur via l'API Canvas : ne consomme aucun Mo de forfait Togocom/Moov.
  * Mode *"Scan Administratif"* : convertit en niveaux de gris et renforce le contraste pour effacer les ombres de photo de smartphone.
  * Export direct en PDF A4 prêt à téléverser.
* **Générateur Express de Reçu PDF WhatsApp :**
  * Conçu pour les vendeurs WhatsApp, friperies, mèches et commerçants de Lomé.
  * Rendu et prévisualisation du ticket de caisse en temps réel sur l'écran.
  * Partage direct du texte formaté sur WhatsApp.
* **Simulateur de Frais de Retrait T-Money & Flooz :**
  * Calcul automatique du montant exact à envoyer pour un retrait net au kiosque.
  * Génération de la syntaxe USSD officielle prête à copier.

### 2. 📱 Navigation Mobile (Menu Hamburger 3 Traits)
* Tiroir coulissant fluide avec accès instantané à toutes les sections : Outils, Veille & Astuces, Services CV, Affiliation et Gestion du Pass.

### 3. 🎓 Micro-Learning & Astuces Locales
* Les **5 astuces togolaises du Jour 1** (concours < 500 Ko, économie x3 de forfaits Togocom/Moov, carte Visa prépayée UBA Africard, anti-arnaque, démarchage WhatsApp).
* Les **3 premières micro-formations de 15 min** (IA sur mobile, vente WhatsApp pro, lancement de micro-service freelance avec 0 FCFA).

### 4. 💼 Micro-Services Assistés par IA
* Commandes de rédaction de CV professionnel, audit de dossier et lettres de motivation avec réduction de 50% pour les abonnés du Pass.
* Redirection automatisée vers WhatsApp Business pour le traitement humain rapide.

### 5. 🤝 Programme Ambassadeur Campus (Affiliation)
* **500 FCFA nets** sur le premier Pass Mensuel (1 500 FCFA) parrainé.
* **250 FCFA récurrents** chaque mois tant que le filleul renouvelle.
* Simulateur interactif de gains et jauge de retrait avec seuil minimal sécurisé à 1 000 FCFA.

---

## 🛠️ Stack Technique 0 FCFA

* **Frontend :** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
* **PWA & Offline :** `vite-plugin-pwa` + Workbox Service Worker + Cache-First
* **Traitement PDF :** `jspdf` (génération vectorielle locale client-side)
* **Backend & Auth (Prêt) :** Supabase (PostgreSQL + RLS + Storage)
* **Déploiement :** Vercel / Cloudflare Pages

---

## 💻 Commandes Utiles (Dans Termux)

```bash
# Lancer le serveur de développement local
npm run dev

# Tester la compilation de production
npm run build
```
