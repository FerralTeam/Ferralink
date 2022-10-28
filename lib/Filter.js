class Filters {
  constructor(player, options = {}) {
    this.player = player;
    this.node = player.node;
    this.volume = 1.0;
}
updateFilters() {
    const { volume } = this;
    this.node.send({
      op: "filters",
      guildId: this.player.guildId,
      volume,
    });
  }
}
  module.exports = Filters;