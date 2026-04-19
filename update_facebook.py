import re

with open('src/app/features/chat/pages/facebook-workspace/facebook-workspace.component.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the `.chat-main` wrapper and use `.bg-gray-50.min-h-screen.p-6`
content = content.replace('<div class="chat-main">', '<div class="bg-gray-50 min-h-screen p-6">')
content = content.replace('<div class="chat-content-wrapper">', '<div>')
content = content.replace('<div class="chat-content-inner">', '<div>')

# Replace Hero (when loaded)
hero_loaded = """<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <i class="pi pi-share-alt text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Unified Support Inbox</h1>
          <p class="text-gray-600">One chat UI for every connected channel. This workspace now uses the same live APIs as `/chat`, so queue, detail, reply, and template flows stay consistent.</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <p-button icon="pi pi-chart-bar" label="Overview" severity="secondary" [outlined]="true" [rounded]="true" (onClick)="openOverviewDialog()"></p-button>
        <p-button icon="pi pi-refresh" label="Refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadWorkspace()"></p-button>
        <div class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 flex items-center gap-2">
           <i class="pi pi-comments"></i> {{ filteredConversations.length }} visible threads
        </div>
      </div>
    </div>
  </div>"""

content = re.sub(r'<section class="chat-hero omni-hero">.*?</div>\s*</section>', hero_loaded, content, flags=re.DOTALL)

# Same for Loading Hero - Actually both Hero are caught by the above regex, let's just do it manually.
