<template>
  <div class="not-found">
    <h1>404 - Sidan hittades inte</h1>
    <p>Ursäkta, sidan du letar efter verkar inte finnas.</p>
    <router-link to="/">Gå till startsidan</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
.not-found h1 {
  font-size: 3em;
  color: #333;
}
.not-found p {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 20px;
}
.not-found a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.not-found a:hover {
  text-decoration: underline;
}
</style>
