<!-- IMPORT partials/breadcrumbs.tpl -->
<h1 class="categories-title">[[pages:categories]]</h1>
<ul class="sections" itemscope itemtype="http://www.schema.org/ItemList">
<!-- BEGIN sections -->
  <li class="row clearfix section">
    <h3 class="page-header">{sections.name}</h3>
    <ul class="categories">
    	<!-- BEGIN categories -->
    	<!-- IMPORT partials/categories/item.tpl -->
    	<!-- END categories -->
    </ul>
  </li>
<!-- END sections -->
</ul>