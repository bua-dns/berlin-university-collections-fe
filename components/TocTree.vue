<script setup>
defineOptions({ name: "TocTree" });

const props = defineProps({
	nodes: {
		type: Array,
		required: true,
	},
});

const nodes = computed(() => (Array.isArray(props.nodes) ? props.nodes : []));

const handleClick = (event, id) => {
	event.preventDefault();
	event.stopPropagation();
	const target = document.getElementById(id);
	const main = document.getElementsByTagName("main")[0];
	if (target && main) {
		const headerOffset = main.classList.contains("scrolled") ? 88 : 152;
		const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
		const offsetPosition = elementPosition - headerOffset;

		window.scrollTo({ top: Math.max(offsetPosition, 0), behavior: "smooth" });
	}
};
</script>

<template>
	<ul v-if="nodes.length">
			<li v-for="node in nodes" :key="node.id">
				<a :href="`#${node.id}`" v-html="node.title" @click="handleClick($event, node.id)" />
			<TocTree
				v-if="node.children && node.children.length"
				:nodes="node.children"
			/>
		</li>
	</ul>
</template>
